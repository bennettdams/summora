import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/prisma'

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
  await prisma.postCategory.deleteMany({})
  await prisma.postTag.deleteMany({})
}

async function fill() {
  await prisma.postCategory.createMany({ data: postCategories })
  const postCategoriesCreated = await prisma.postCategory.findMany()

  await prisma.postTag.createMany({ data: postTags })
  const postTagsCreated = await prisma.postTag.findMany()

  const users = await prisma.user.findMany()

  await prisma.post.createMany({
    data: [...new Array(100)].map((_, i) => {
      const category = getRandomElementOfArray(postCategoriesCreated)
      return {
        title: `${category.title} ${loremRandom()} ${i + 1}`,
        subtitle: `Subtitle - ${loremRandom()} ${i + 1}`,
        postCategoryId: category.id,
        authorId: getRandomElementOfArray(users).userId,
      }
    }),
  })

  const postsCreated = await prisma.post.findMany()
  postsCreated.forEach(async (post) => {
    await new Promise((r) => setTimeout(r, 10))
    await prisma.post.update({
      data: {
        tags: {
          connect: [...new Array(getRandomNumberForRange(1, 15))].map(() => ({
            id: getRandomElementOfArray(postTagsCreated).id,
          })),
        },
        segments: {
          create: createSegments(),
        },
      },
      where: { id: post.id },
    })

    // root comments
    Array.from({ length: getRandomNumberForRange(1, 3) }).map(async (_, i1) => {
      const in1 = i1 + 1
      const text1 = loremRandom() + ' ' + in1
      const com1 = await prisma.postComment.create({
        data: {
          text: text1,
          postId: post.id,
          authorId: getRandomElementOfArray(users).userId,
        },
      })
      await new Promise((r) => setTimeout(r, 300))

      Array.from({ length: getRandomNumberForRange(1, 3) }).map(
        async (_, i2) => {
          const in2 = i2 + 1
          const text2 = loremRandom() + ' ' + in1 + '-' + in2
          const com2 = await prisma.postComment.create({
            data: {
              text: text2,
              postId: post.id,
              commentParentId: com1.commentId,
              authorId: getRandomElementOfArray(users).userId,
            },
          })
          await new Promise((r) => setTimeout(r, 300))

          Array.from({ length: getRandomNumberForRange(1, 3) }).map(
            async (_, i3) => {
              const in3 = i3 + 1
              const text3 = loremRandom() + ' ' + in1 + '-' + in2 + '-' + in3
              const com3 = await prisma.postComment.create({
                data: {
                  text: text3,
                  postId: post.id,
                  commentParentId: com2.commentId,
                  authorId: getRandomElementOfArray(users).userId,
                },
              })
              await new Promise((r) => setTimeout(r, 300))

              Array.from({ length: getRandomNumberForRange(1, 3) }).map(
                async (_, i4) => {
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
                      authorId: getRandomElementOfArray(users).userId,
                    },
                  })
                  await new Promise((r) => setTimeout(r, 300))
                }
              )
            }
          )
        }
      )
    })
  })

  return postsCreated.length
}

export const postCategories: Prisma.PostCategoryCreateInput[] = [
  { id: 'books', title: 'Books', description: '..' },
  { id: 'movies', title: 'Movies', description: '..' },
  { id: 'series', title: 'Series', description: '..' },
  { id: 'music', title: 'Music', description: '..' },
  { id: 'gaming', title: 'Gaming', description: '..' },
  { id: 'pc-electronics', title: 'PC & Electronics', description: '..' },
  { id: 'household', title: 'Electronic', description: '..' },
  { id: 'animals', title: 'Animals', description: '..' },
  { id: 'nature', title: 'Nature', description: '..' },
  { id: 'beauty', title: 'Beauty', description: '..' },
  { id: 'vehicles', title: 'Vehicles', description: '..' },
  { id: 'food-drinks', title: 'Food & drinks', description: '..' },
  { id: 'education', title: 'Education', description: '..' },
  { id: 'babys', title: 'Babys', description: '..' },
  { id: 'fashion', title: 'Fashion', description: '..' },
  { id: 'sports', title: 'Sports', description: '..' },
]

export const postTags: Prisma.PostTagCreateWithoutPostsInput[] = [
  ...new Array(100),
].flatMap((_, i) => [
  { title: 'Tutorial' + i, description: '..' },
  { title: 'Summary' + i, description: '..' },
  { title: 'How-to' + i, description: '..' },
  { title: 'Knowledge' + i, description: '..' },
  { title: 'Legal' + i, description: '..' },
  {
    title: 'Everyday life' + i,
    description: '..',
  },
  { title: 'For dummies' + i, description: '..' },
  { title: 'History' + i, description: '..' },
])

function createSegments(): Prisma.PostSegmentCreateManyPostInput[] {
  return [...new Array(getRandomNumberForRange(1, 10))].map((_, index) => {
    const now = new Date().getTime()
    const step = 100

    // const postSegment: Prisma.PostSegmentCreateManyPostInput = {}

    return {
      createdAt: new Date(now + 1 * step),
      title: `Segment title ${loremRandom()} ${index}`,
      subtitle: `Subtitle ${loremRandom()} ${index}`,
      items: {
        create: Array.from({ length: getRandomNumberForRange(1, 10) }).map(
          () => ({
            createdAt: new Date(now + 1 * step),
            content: loremRandom(),
          })
        ),
      },
    }
  })
}

function getRandomNumberForRange(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomElementOfArray<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function loremRandom() {
  const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  return lorem.substring(0, getRandomNumberForRange(5, lorem.length))
}
