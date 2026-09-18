const images = [
  '/art/2017-06-03_20-34-40_UTC.jpg',
  '/art/2017-07-21_15-48-48_UTC.jpg',
  '/art/2018-01-01_04-38-11_UTC.jpg'
]

export function HomeImageRail() {
  return (
    <aside className='site-image-rail' aria-hidden='true'>
      {images.map((src) => (
        <img key={src} src={src} alt='' />
      ))}
    </aside>
  )
}
