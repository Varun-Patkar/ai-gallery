import dynamic from "next/dynamic";
import Head from "next/head";

// Dynamically import the Scene component with SSR disabled
const Scene = dynamic(() => import("@/components/Scene"), {
	ssr: false,
});

export default function Home() {
	return (
		<div>
			<Head>
				<title>Your Multiverse Vault</title>
				<meta name="description" content="Virtual Art Gallery Experience" />
				{/* Favicon Links */}
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				{/* Add the standard favicon.ico link */}
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main>
				<Scene />
			</main>
		</div>
	);
}
