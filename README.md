# waifu2x-cli-4k
A simple CLI tool to upscale a folder of images to 4K using waifu2x.

It's hacky but it works<sup>tm</sup>.

I might work on this later and add more parameters. I also might not.

![sample_usage](https://i.imgur.com/QAw3pO8.png)


## Dependencies
- [NodeJS](https://nodejs.org/)
- [image-size](https://www.npmjs.com/package/image-size)


## Installation
1. Clone the repository anywhere.
2. Install dependencies with `npm install`
3. (optional) Make sure Node is in your PATH
4. Run the script from the command line


## Usage
`node upscale_backlog.js <direct path to src folder> <direct path to dest folder>`

- Upscales all images in the source folder to 4K (or as low as it can get).
- Saves all upscaled images in destination folder.
- Deletes images from source folder after they've been copied to destination folder.
- If an image is already 4K or greater, it gets moved and deleted without being upscaled.
- Only works on images, no .gifs or videos.
