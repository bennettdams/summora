import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await drop()

  let noOfPostsCreated = 0
  if ((await prisma.post.count()) === 0) {
    noOfPostsCreated = await fill()
  }

  const message = `seeded ${noOfPostsCreated} posts`
  console.info(message)
}

main()
  .catch((e) => {
    console.error('Error while seeding database: ', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

async function drop() {
  await prisma.postComment.deleteMany({})
  await prisma.postSegmentItem.deleteMany({})
  await prisma.postSegment.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.postTag.deleteMany({})
  await prisma.donationLink.deleteMany({})
}

async function sleep() {
  await new Promise((r) => setTimeout(r, 1000))
}

async function fill() {
  const postCategoriesCreated = await prisma.postCategory.findMany()

  await prisma.postTag.createMany({ data: postTags })
  const postTagsCreated = await prisma.postTag.findMany()

  if ((await prisma.user.findMany()).length === 0) {
    await prisma.user.createMany({
      data: [
        { username: 'bennett-mock' },
        { username: 'foo-mock' },
        { username: 'bar-mock' },
      ],
    })
  }

  const users = await prisma.user.findMany()

  await Promise.all(
    Array.from({ length: getRandomNumberForRange(50, 100) }).map(
      async (_, i) => {
        await sleep()
        const category = getRandomElementOfArray(postCategoriesCreated)
        await prisma.post.create({
          data: {
            title: `${category.name} ${loremRandom()} ${i + 1}`,
            subtitle: `Subtitle - ${loremRandom()} ${i + 1}`,
            postCategoryId: category.id,
            authorId: getRandomElementOfArray(users).id,
          },
        })
      }
    )
  )

  const postsCreated = await prisma.post.findMany()
  await Promise.all(
    postsCreated.map(async (post) => {
      await sleep()
      const segments = await createSegments()
      // tags & segments
      const postUpdated = await prisma.post.update({
        where: { id: post.id },
        data: {
          tags: {
            connect: [...new Array(getRandomNumberForRange(1, 15))].map(() => ({
              tagId: getRandomElementOfArray(postTagsCreated).tagId,
            })),
          },
          segments: {
            createMany: {
              data: segments,
            },
          },
        },
        include: { segments: true },
      })

      // segment items
      await Promise.all(
        postUpdated.segments.map(async (segment) => {
          await sleep()

          await Promise.all(
            Array.from({ length: getRandomNumberForRange(1, 7) }).map(
              async (_, i) => {
                await prisma.postSegmentItem.create({
                  data: {
                    content: `Content ${loremRandom()} ${i}`,
                    postSegmentId: segment.id,
                  },
                })
              }
            )
          )
        })
      )

      // root comments
      await Promise.all(
        Array.from({ length: getRandomNumberForRange(1, 3) }).map(
          async (_, i1) => {
            const in1 = i1 + 1
            const text1 = loremRandom() + ' ' + in1
            const com1 = await prisma.postComment.create({
              data: {
                text: text1,
                postId: post.id,
                authorId: getRandomElementOfArray(users).id,
              },
            })
            await sleep()

            await Promise.all(
              Array.from({ length: getRandomNumberForRange(1, 3) }).map(
                async (_, i2) => {
                  const in2 = i2 + 1
                  const text2 = loremRandom() + ' ' + in1 + '-' + in2
                  const com2 = await prisma.postComment.create({
                    data: {
                      text: text2,
                      postId: post.id,
                      commentParentId: com1.commentId,
                      authorId: getRandomElementOfArray(users).id,
                    },
                  })
                  await sleep()

                  await Promise.all(
                    Array.from({ length: getRandomNumberForRange(1, 3) }).map(
                      async (_, i3) => {
                        const in3 = i3 + 1
                        const text3 =
                          loremRandom() + ' ' + in1 + '-' + in2 + '-' + in3
                        const com3 = await prisma.postComment.create({
                          data: {
                            text: text3,
                            postId: post.id,
                            commentParentId: com2.commentId,
                            authorId: getRandomElementOfArray(users).id,
                          },
                        })
                        await sleep()

                        await Promise.all(
                          Array.from({
                            length: getRandomNumberForRange(1, 3),
                          }).map(async (_, i4) => {
                            const in4 = i4 + 1
                            const text4 =
                              loremRandom() +
                              ' ' +
                              in1 +
                              '-' +
                              in2 +
                              '-' +
                              in3 +
                              '-' +
                              in4
                            await prisma.postComment.create({
                              data: {
                                text: text4,
                                postId: post.id,
                                commentParentId: com3.commentId,
                                authorId: getRandomElementOfArray(users).id,
                              },
                            })
                            await sleep()
                          })
                        )
                      }
                    )
                  )
                }
              )
            )
          }
        )
      )
    })
  )

  return postsCreated.length
}

async function createSegments(): Promise<
  Prisma.PostSegmentCreateManyPostInput[]
> {
  const segments: Prisma.PostSegmentCreateManyPostInput[] = await Promise.all(
    Array.from({ length: getRandomNumberForRange(1, 5) }).map(
      async (_, index) => {
        await sleep()

        const segment: Prisma.PostSegmentCreateManyPostInput = {
          title: `Segment title ${loremRandom()} ${index}`,
          subtitle: `Subtitle ${loremRandom()} ${index}`,
        }

        return segment
      }
    )
  )

  return segments
}

const postTags: Prisma.PostTagCreateWithoutPostsInput[] = [
  ...new Array(100),
].flatMap((_, i) => [
  { label: 'Tutorial' + i },
  { label: 'Summary' + i },
  { label: 'How-to' + i },
  { label: 'Knowledge' + i },
  { label: 'Legal' + i },
  {
    label: 'Everyday life' + i,
  },
  { label: 'For dummies' + i },
  { label: 'History' + i },
])

function getRandomNumberForRange(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomElementOfArray<T>(arr: T[]): T {
  const element = arr[Math.floor(Math.random() * arr.length)]

  if (!element) {
    throw new Error('There is no element when accessing a random one.')
  } else {
    return element
  }
}

function loremRandom() {
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  return lorem.substring(0, getRandomNumberForRange(5, lorem.length))
}
