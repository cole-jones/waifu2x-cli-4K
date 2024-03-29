var waifu2x = require('waifu2x');
var sizeOf = require('image-size');
var fs = require('fs');

const progress = (current, total) => {
	process.stdout.moveCursor(0, -1)
	process.stdout.clearLine(1)
	process.stdout.write(`\nUpscaling image ${current}/${total}...`)
};

async function upscale_images(files) {
	for (let i = 0; i < files.length; i++) {
		let file_path = files[i].file_path;
		let original_file = files[i].original_file;
		let new_path = files[i].new_path;
		let img_scale = files[i].img_scale;
		
		progress(i + 1, files.length);
		await waifu2x.default.upscaleImage(file_path, new_path, { noise: 1, scale: img_scale })
							 .then(() => {
								/// Sometimes images don't actually get upscaled for some reason.
								/// Instead of deleting the files, move them to a trash file.
								// Delete the file from folder_to_upscale
								//fs.unlinkSync(file_path);
								try {
									fs.copyFileSync(file_path, "C:\\upscale_trash\\" + original_file);
									fs.unlinkSync(file_path);
								} catch (error) {
									console.error(error)
								}
							 });
	}
};

const prep_files = () => {
	// Make sure there's enough arguments
	if (process.argv.length > 5) {
		console.log("Too many arguments!");
		return 0;
	}

	// Get folder that contains files to upscale, folder in which to save upscaled images, optional name of artist
	let folder_to_upscale = process.argv[2];
	let save_folder = process.argv[3];
	let artist = process.argv[4];

	files_to_upscale = [];

	// Flag for displaying message for moving images that are already 4K
	moved_4k = 0;

	// Print folder paths
	console.log("");
	console.log(`   Upscaling files from      \"${folder_to_upscale}\"`);
	console.log(`   Saving upscaled files to  \"${save_folder}\"`);
	console.log("");

	// Get all names of files in folder_to_upscale
	let file_names = fs.readdirSync(folder_to_upscale);

	// If an artist was specified, only get files for that artist
	if (artist)
		file_names = file_names.filter(f => f.includes(`${artist}_`));

	// Run through all files in the folder
	file_names.forEach((filename) => {
		// Ignore annoying desktop.ini file, just ignore all .ini I guess
		if (!filename.includes('.ini')) {
			// Change new image type to .png
			let last_dot = filename.lastIndexOf('.');
			let last_slash = filename.lastIndexOf('\\');
			let original_file = filename.substr(last_slash + 1)
			let png_file = filename.substr(0, last_dot) + '.png';
			
			// Get old and new filepaths
			let file_path = folder_to_upscale + "\\" + filename;
			let new_path = save_folder + "\\" + png_file;

			// Get height and width of image
			let dimensions = 0
			try {
				dimensions = sizeOf(file_path);
			} catch {
				console.log(`!!! ${filename} corrupted!`);
				return 0;
			}
			let height = dimensions.height;
			let width = dimensions.width;

			// If width or height already >= 4K, just move the file to the save_folder
			if (height >= 2160 || width >= 3840) {
				if (moved_4k === 0)
					process.stdout.write("Copying images that are already 4K...");

				// Increment counter
				moved_4k += 1;

				// Copy the file to save_folder
				fs.copyFileSync(file_path, new_path);

				// Delete the file from folder_to_upscale
				fs.unlinkSync(file_path);
			}
			else {
				// Find x/y scale to make image 4K in one direction
				// Use the lower of the two values
				let height_scale = Math.ceil(10 * (2160 / height)) / 10;
				let width_scale = Math.ceil(10 * (3840 / width)) / 10;

				let img_scale = height_scale < width_scale ? height_scale : width_scale;

				// Add file paths/img_scale object to array
				files_to_upscale.push({ img_scale: img_scale, file_path: file_path, new_path: new_path, original_file: original_file });
			}
		}
	});

	if (moved_4k > 0)
		console.log(`  ${moved_4k} images moved!\n`);

	// Return array of file objects
	return files_to_upscale;
};

// Get array of file objects and scales
files = prep_files();

// Break if there was an error
if (files === 0) {
	console.log("  ERROR!");
	return;
}

// Upscale all of the images.
// Handles saving them to new location, deleting old image
upscale_images(files).then(() => {
	console.log("  Done!");
});
