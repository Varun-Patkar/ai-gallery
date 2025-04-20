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
				<link rel="icon" href="/favicon.ico" /> {/* Optional: Add a favicon */}
			</Head>
			<main>
				<Scene />
			</main>
		</div>
	);
}
