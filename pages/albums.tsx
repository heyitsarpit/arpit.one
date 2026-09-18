import type { GetServerSideProps } from 'next'

const AlbumsRedirect: React.FC = () => null

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/playlists/albums',
    permanent: false
  }
})

export default AlbumsRedirect
