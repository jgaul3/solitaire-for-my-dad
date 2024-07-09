import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export const ROOT_URL = process.env.NODE_ENV === "development" ? "" : "/solitaire-for-my-dad"

export default function Home() {
  console.log(process.env.NODE_ENV);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="manifest" href={ROOT_URL.concat("/manifest.json")}/>
        <link rel="apple-touch-icon" href={ROOT_URL.concat("/apple-touch-icon.png")}></link>
        <meta name="theme-color" content="#fff"/>
        <link rel="icon" href={ROOT_URL.concat("/favicon.ico")}/>
      </Head>
      <main className={styles.main}>
        <p>
          Get started
        </p>
      </main>
    </>
  )
}