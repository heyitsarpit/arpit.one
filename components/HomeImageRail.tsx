import Image from 'next/image'

const images = [
  '/art/2017-06-03_20-34-40_UTC.jpg',
  '/art/2017-07-21_15-48-48_UTC.jpg',
  '/art/2018-01-01_04-38-11_UTC.jpg'
]

export function HomeImageRail() {
  return (
    <aside
      className='flex w-[95px] shrink-0 flex-col gap-0 max-lg:hidden'
      aria-hidden='true'>
      {images.map((src) => (
        <Image
          key={src}
          className='block h-[95px] w-[95px] object-cover grayscale opacity-[0.72]'
          src={src}
          alt=''
          width={95}
          height={95}
        />
      ))}
    </aside>
  )
}
