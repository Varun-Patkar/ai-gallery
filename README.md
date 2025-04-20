# AI Gallery - Universe Conqueror's Vault

## Description

Welcome, Universe Conqueror! This project is a 3D interactive gallery showcasing powerful artifacts from the Marvel Universe. You, the most powerful being, are visiting your private vault to reminisce about the "good old days".

The scene is built using React, Three.js, React Three Fiber, Drei, and Rapier for physics. The main feature is your AI Butler, Alfred, powered locally in your browser using WebLLM and the Llama 3.1 8B model. Alfred is designed to be... well, let's just say he has a personality, programmed with a healthy dose of sass and wit as per your specifications.

This project was primarily an exercise to showcase 3D and AI integration skills within a short timeframe.

## Features

- **3D Gallery:** Explore a detailed vault environment.
- **First-Person Controls:** Navigate the vault using standard WASD controls and mouse look.
- **Interactable Artifacts:** Look at artifacts like Iron Man's Mk 1 Armor, Captain America's Shield, Mjolnir, and Spider-Man's Mask.
- **AI Butler (Alfred):** Press 'P' to chat with Alfred. He's aware of what you're looking at (sometimes) and will respond with characteristic sass. Powered by WebLLM running locally.
- **Background Music:** Toggle ambient music with the 'M' key.

## Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Varun-Patkar/universe-conqueror-ai.git](https://github.com/Varun-Patkar/universe-conqueror-ai.git)
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

**Note:** WebLLM requires downloading the language model (approx. 4GB) the first time you load the page. Ensure you have sufficient disk space and a stable internet connection. Performance depends heavily on your hardware (GPU is recommended).

## Deployed Version

- **Link:** [TBD - Add deployment link here]

## YouTube Demo

- **Video:** [TBD - Add YouTube link here]

## Development Notes

This project was developed casually over approximately 3 days alongside other activities (like gaming!).

- **AI Assistance:** Roughly 50% of the code was generated or assisted by GitHub Copilot.
- **Bug Fixing:** Around 20% of the time was spent debugging issues, often related to AI suggestions or library integrations.
- **Manual Coding:** The remaining 30% involved manual coding, particularly when integrating complex features or when AI suggestions were insufficient.
- **Optimization:** Performance optimization was _not_ a primary goal. The project is resource-intensive, especially due to the local LLM and 3D rendering. It serves mainly as a proof-of-concept.

## Attributions

- **3D Model:** "Metallic Showroom Gallery" by [jimbogies](https://skfb.ly/oEyUM) licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). (Individual artifact licenses are in their respective `/public` folders).
- **Music:** "Calm Gaming Flow" by [Fopihe](https://pixabay.com/users/fopihe-49678680/) from [Pixabay](https://pixabay.com/).
