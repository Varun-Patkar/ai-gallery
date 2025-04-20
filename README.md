# AI Gallery - Universe Conqueror's Vault

## Description

This project presents a 3D interactive gallery showcasing powerful artifacts from the Marvel Universe. The premise places the user in the role of the Universe Conqueror, visiting their private vault to reminisce about the "good old days".

The scene is built using React, Three.js, React Three Fiber, Drei, and Rapier for physics. A key feature is the AI Butler, Alfred, powered locally in the user's browser using WebLLM and the Llama 3.1 8B model. Alfred is designed with a distinct personality, programmed with sass and wit.

This project was developed by the creator primarily as an exercise to showcase 3D and AI integration skills within a short timeframe.

## Features

- **3D Gallery:** Explore a detailed vault environment.
- **First-Person Controls:** Navigate the vault using standard WASD controls and mouse look.
- **Interactable Artifacts:** Look at artifacts like Iron Man's Mk 1 Armor, Captain America's Shield, Mjolnir, and Spider-Man's Mask.
- **AI Butler (Alfred):** Press 'P' to chat with Alfred. He's aware of what the user is looking at (sometimes) and will respond with characteristic sass. Powered by WebLLM running locally.
- **Background Music:** Toggle ambient music with the 'M' key.

## Local Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url> # Replace with the actual repository URL
    cd ai-gallery
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** WebLLM requires downloading the language model (approx. 4GB) the first time the page is loaded. Ensure sufficient disk space and a stable internet connection. Performance depends heavily on the user's hardware (GPU is recommended).

## Deployed Version

- **Link:** [https://universe-conqueror-ai.vercel.app/](https://universe-conqueror-ai.vercel.app/)

## YouTube Demo

- **Video:** [https://youtu.be/Gt_kxUQwSLY?si=-LbCM-hq_s16y5Wu](https://youtu.be/Gt_kxUQwSLY?si=-LbCM-hq_s16y5Wu)

## Development Notes

This project was developed casually by the creator over approximately 3 days alongside other activities.

- **AI Assistance:** Roughly 50% of the code was generated or assisted by GitHub Copilot.
- **Bug Fixing:** Around 20% of the development time was spent debugging issues, often related to AI suggestions or library integrations.
- **Manual Coding:** The remaining 30% involved manual coding by the creator, particularly when integrating complex features or when AI suggestions were insufficient.
- **Optimization:** Performance optimization was _not_ a primary goal. The project is resource-intensive, especially due to the local LLM and 3D rendering. It serves mainly as a proof-of-concept.

## Attributions

- **3D Model:** "Metallic Showroom Gallery" by [jimbogies](https://skfb.ly/oEyUM) licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). (Individual artifact licenses are in their respective `/public` folders).
- **Music:** "Calm Gaming Flow" by [Fopihe](https://pixabay.com/users/fopihe-49678680/) from [Pixabay](https://pixabay.com/).
