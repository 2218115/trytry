window.onload = () => {
	////////////// binding
	const elInputFileImage = document.getElementById("input-file-image");
	const elCanvasImageInput = document.getElementById("canvas-image-input");
	const elTBodyValueInputImageR = document.getElementById("tbody-value-input-image-r");
	const elTBodyValueInputImageG = document.getElementById("tbody-value-input-image-g");
	const elTBodyValueInputImageB = document.getElementById("tbody-value-input-image-b");
	const elCanvasHistogramImageInputR = document.getElementById("canvas-histogram-image-input-r");
	const elCanvasHistogramImageInputG = document.getElementById("canvas-histogram-image-input-g");
	const elCanvasHistogramImageInputB = document.getElementById("canvas-histogram-image-input-b");
	const elButtonShowOrHideRTableInputImage = document.getElementById("button-table-r-input-image");
	const elButtonShowOrHideGTableInputImage = document.getElementById("button-table-g-input-image");
	const elButtonShowOrHideBTableInputImage = document.getElementById("button-table-b-input-image");

	const elTBodyValueInputImageGray = document.getElementById("tbody-value-gray-image");
	const elButtonShowOrHideTableGrayImage = document.getElementById("button-table-gray-image");
	const elCanvasHistogramImageGray = document.getElementById("canvas-histogram-image-gray");
	const elCanvasImageGray = document.getElementById("canvas-image-gray");

	// filtered gray image
	const elCanvasHistogramImageGrayFiltered = document.getElementById("canvas-histogram-image-gray-filtered");
	const elButtonShowOrHideTableGrayImageFiltered = document.getElementById("button-table-gray-image-filtered");
	const elTBodyValueImageGrayFiltered = document.getElementById("tbody-gray-image-filtered");
	const elCanvasImageGrayFiltered = document.getElementById("canvas-image-gray-filtered");

	// monochrome image
	const elCanvasHistogramImageMonocrhome = document.getElementById("canvas-histogram-image-monchrome");
	const elButtonShowOrHideTableMonochrome = document.getElementById("button-table-image-monochrome");
	const elTBodyValueImageMonochrome = document.getElementById("tbody-image-monochrome");
	const elCanvasImageMonochrome = document.getElementById("canvas-image-monochrome");

	// label buffer
	const elTBodyValueTableLabelBuffer = document.getElementById("tbody-label-buffer");

	// masked image result
	const elTBodyValueImageMasked = document.getElementById("tbody-value-image-masked");
	const elButtonShowOrHideImageMasked = document.getElementById("button-table-image-masked-result");
	const elCanvasHistogramImageMasked = document.getElementById("canvas-histogram-image-masked-result");
	const elCanvasImageMasked = document.getElementById("canvas-image-masked-result");
	const ctxCanvasImageMasked = elCanvasImageMasked.getContext("2d");
	const ctxCanvasHistogramImageMasked = elCanvasHistogramImageMasked.getContext("2d");

	///////////// event 
	elInputFileImage.onchange = handleOnChangeFileImage;
	elButtonShowOrHideRTableInputImage.onclick = handleButtonShowHideRTableInputImage;
	elButtonShowOrHideGTableInputImage.onclick = handleButtonShowHideGTableInputImage;
	elButtonShowOrHideBTableInputImage.onclick = handleButtonShowHideBTableInputImage;
	elButtonShowOrHideTableGrayImage.onclick = handleButtonShowHideGrayImage;
	elButtonShowOrHideTableGrayImageFiltered.onclick = handleButtonShowHideGrayImageFiltered;
	elButtonShowOrHideTableMonochrome.onclick = handleButtonShowHidImageeMonochrome;

	const ctxCanvasImageInput = elCanvasImageInput.getContext("2d");
	const ctxCanvasHistogramImageInputR = elCanvasHistogramImageInputR.getContext("2d");
	const ctxCanvasHistogramImageInputG = elCanvasHistogramImageInputG.getContext("2d");
	const ctxCanvasHistogramImageInputB = elCanvasHistogramImageInputB.getContext("2d");
	const ctxCanvasGrayImage = elCanvasImageGray.getContext("2d");
	const ctxCanvasHistogramImageGray = elCanvasHistogramImageGray.getContext("2d");
	const ctxCanvasGrayImageFiltered = elCanvasImageGrayFiltered.getContext("2d");
	const ctxCanvasHistogramImageGrayFiltered = elCanvasHistogramImageGrayFiltered.getContext("2d");
	const ctxCanvasImageMonochrome = elCanvasImageMonochrome.getContext("2d");
	const ctxCanvasHistogramImageMonochrome = elCanvasHistogramImageMonocrhome.getContext("2d");

	function handleOnChangeFileImage() {
		const file = elInputFileImage.files[0];
		const { name, size, type } = file;

		const inputImage = new Image();
		inputImage.src = URL.createObjectURL(file);
		inputImage.onload = () => {
			const width = inputImage.width;
			const height = inputImage.height;

			elCanvasImageInput.width = width;
			elCanvasImageInput.height = height;
			ctxCanvasImageInput.drawImage(inputImage, 0, 0);
			const inputImageData = ctxCanvasImageInput.getImageData(0, 0, width, height);

			const imageBuffer = structuredClone(inputImageData);

			// input image drawing information
			renderImageValueOnTable(elTBodyValueInputImageG, inputImageData.data, 1, width, height, "G");
			renderImageValueOnTable(elTBodyValueInputImageB, inputImageData.data, 2, width, height, "B");
			const [redHist, greenHist, blueHist] = getHistValuesFromImageData(inputImageData.data);
			renderHistogramOnCanvas(ctxCanvasHistogramImageInputR, redHist);
			renderHistogramOnCanvas(ctxCanvasHistogramImageInputG, greenHist);
			renderHistogramOnCanvas(ctxCanvasHistogramImageInputB, blueHist);

			// gray image drawing information
			elCanvasImageGray.width = width;
			elCanvasImageGray.height = height;

			// do grayscale color image conversion
			for (let i = 0; i < imageBuffer.data.length; i += 4) {
				const val = Math.round((imageBuffer.data[i + 0] + imageBuffer.data[i + 1] + imageBuffer.data[i + 2]) / 3);
				imageBuffer.data[i + 0] = val;
				imageBuffer.data[i + 1] = val;
				imageBuffer.data[i + 2] = val;
			}

			// render a grayscaled image
			ctxCanvasGrayImage.putImageData(imageBuffer, 0, 0);
			const grayHist = getHistValuesFromImageData(imageBuffer.data);
			renderImageValueOnTable(elTBodyValueInputImageGray, imageBuffer.data, 0, width, height, "Gray");
			renderHistogramOnCanvas(ctxCanvasHistogramImageGray, grayHist[0]);


			//filtering image using a mean filtering
			for (let row = 1; row < height - 1; ++row) {
				for (let col = 1; col < width - 1; ++col) {
					const val = calcMean(row, col, 3, 3, imageBuffer.data, width, height);
					const index = col * 4 + (row * width * 4);

					imageBuffer.data[index + 0] = imageBuffer.data[index] = val;
					imageBuffer.data[index + 1] = imageBuffer.data[index] = val;
					imageBuffer.data[index + 2] = imageBuffer.data[index] = val;
				}
			}

			ctxCanvasGrayImageFiltered.putImageData(imageBuffer, 0, 0);
			const filteredGrayHist = getHistValuesFromImageData(imageBuffer.data);
			renderImageValueOnTable(elTBodyValueImageGrayFiltered, imageBuffer.data, 0, width, height, "Gray");
			renderHistogramOnCanvas(ctxCanvasHistogramImageGrayFiltered, filteredGrayHist[0]);

			// do convertion on monochrome
			const t = 90;
			for (let i = 0; i < imageBuffer.data.length; i += 4) {
				const val = imageBuffer.data[i];
				imageBuffer.data[i + 0] = val >= t ? 255 : 0;
				imageBuffer.data[i + 1] = val >= t ? 255 : 0;
				imageBuffer.data[i + 2] = val >= t ? 255 : 0;
			}


			ctxCanvasImageMonochrome.putImageData(imageBuffer, 0, 0);
			const monochromeHist = getHistValuesFromImageData(imageBuffer.data);
			renderImageValueOnTable(elTBodyValueImageMonochrome, imageBuffer.data, 0, width, height, "BW", true);
			renderHistogramOnCanvas(ctxCanvasHistogramImageMonochrome, monochromeHist[0], true);

			// do labeling algorithm
			// step is going scan
			let labelBuffer = new Array(imageBuffer.width * imageBuffer.height).fill(0);
			let labelList = new Map();
			let counterLabel = 0;
			for (let row = 1; row < height; ++row) {
				for (let col = 1; col < width; ++col) {
					const index = col * 4 + (row * width * 4);

					// peek top
					//const top = imageBuffer.data[index - (width * 4 * row)];
					//const left = imageBuffer.data[index - 4];
					const val = imageBuffer.data[index];
					if (val == 255) {
						const i = col + (row * width);
						const top = labelBuffer[i - (1 * width)];
						const left = labelBuffer[i - 1];
						const current = labelBuffer[i];

						if (col == 1 && row == 2) {
							console.log({ top, left, current });
						}

						if (labelList.size == 0 || (top == 0 && left == 0)) {
							++counterLabel;
							labelList.set(counterLabel, counterLabel);
							labelBuffer[i] = counterLabel;
						} else if (left != 0 && top == 0) {
							labelBuffer[i] = left;
						} else if (left == 0 && top != 0) {
							labelBuffer[i] = top;
						} else if (left < top) {
							labelBuffer[i] = left;
							labelList.set(top, left);
						} else if (left >= top) {
							labelBuffer[i] = top;
							labelList.set(left, top);
						}

					}
				}
			}

			// remove recursive key val

			let countMap = new Map();
			for (let i = 1; i < labelList.size; ++i) {
				let key = i;
				let value = undefined;
				while (1) {
					value = labelList.get(key);
					if (key === value) {
						break;
					}
					key = value;
				}
				labelList.set(i, key);
				if (countMap.get(key) == undefined) {
					countMap.set(key, countMap.size + 1);
				}
			}

			console.log({ info: "removed recursive label list", countMap, labelList });

			// apply ekuivalen label
			for (let row = 1; row < height; ++row) {
				for (let col = 1; col < width; ++col) {
					const i = col + (row * width);
					const l = labelBuffer[i];
					if (l != 0) {
						// // doing recursive get
						// let key = l;
						// let value = undefined;
						// while (1) {
						// 	if (key === value) {
						// 		break;
						// 	}
						// 	key = value;
						// }
						const value = labelList.get(l);
						labelBuffer[i] = value;
					}
				}
			}

			// for (let row = 1; row < height; ++row) {
			// 	for (let col = 1; col < width; ++col) {
			// 		const i = col + (row * width);
			// 		const l = labelBuffer[i];
			// 		if (l != 0) {
			// 			const e = labelList.get(l);
			// 			labelBuffer[i] = e;
			// 		}
			// 	}
			// }

			console.log(labelList);

			// drawing label buffer into table
			let cValue = "";
			elTBodyValueTableLabelBuffer.innerHTML = "";
			for (let row = 0; row < height; ++row) {
				cValue += "<tr>";

				if (row === 0) {
					cValue += `<td>${"label"}</td>`;
					for (let col = 0; col < width; ++col) {
						cValue += `<td>${col}</td>`;
					}
					cValue += `</tr><tr>`;
				}

				cValue += `<td>${row}</td>`;

				for (let col = 0; col < width; ++col) {
					const val = labelBuffer[col + (row * width)];
					cValue += `<td>${val}</td>`;

				}

				cValue += "</tr>";
			}
			elTBodyValueTableLabelBuffer.innerHTML = cValue;


			// drawing a image label



			// drawing a masked image result
			const resultMaskedImage = new Uint8ClampedArray(width * height * 4).fill(0);

			for (let row = 0; row < height; ++row) {
				for (let col = 0; col < width; ++col) {
					const i = col + (row * width);

					if (labelBuffer[i] != 0) {
						const index = col * 4 + (row * width * 4);
						resultMaskedImage[index] = inputImageData.data[index];
						resultMaskedImage[index + 1] = inputImageData.data[index + 1];
						resultMaskedImage[index + 2] = inputImageData.data[index + 2];
						resultMaskedImage[index + 3] = inputImageData.data[index + 3];
					}

				}
			}


			ctxCanvasImageMasked.putImageData(new ImageData(resultMaskedImage, width, height), 0, 0);
			const maskedHist = getHistValuesFromImageData(imageBuffer.data);
			renderImageValueOnTable(elTBodyValueImageMasked, imageBuffer.data, 0, width, height, "R", false);
			renderHistogramOnCanvas(ctxCanvasHistogramImageMasked, maskedHist[0], false);

			// drawing a label text
			const drawwedMap = new Map();

			for (let row = 0; row < height; ++row) {
				for (let col = 0; col < width; ++col) {
					const i = col + (row * width);

					let key = labelBuffer[i];
					let value = labelList.get(key);
					while (1) {
						value = labelList.get(key);
						if (key == value) {
							e = value;
							break;
						}
						key = value;
					}


					if (drawwedMap.get(value) == undefined) {
						drawwedMap.set(value, true);
						//console.log(labelBuffer[i]);

						ctxCanvasImageMasked.fillText(`${countMap.get(value)}`, col, row);
					}
				}
			}
		}
	}

	function calcMean(row, col, m, n, pixelData, width, height) {
		function offset(val) {
			return Math.floor(val * 0.5);
		}
		let buffer = new Array();
		// @Note: -1 array index is starting from zero
		for (let i = row - offset(m); i <= row + offset(m); ++i) {
			for (let j = col - offset(n); j <= col + offset(n); ++j) {
				if ((i < 0 || j < 0) || (i >= height || j >= width)) {
					// @Note: this is like a zero padding
					buffer.push(0);
				} else {
					const index = j * 4 + (i * width * 4);
					buffer.push(pixelData[index]);
				}
			}
		}

		let sum = 0;
		buffer.forEach((item) => {
			sum += item;
		});

		return sum / (m * n);
	}

	function calcMedian(row, col, m, n, pixelData, width, height) {
		function offset(val) {
			return Math.floor(val * 0.5);
		}
		let buffer = new Array();
		// @Note: -1 array index is starting from zero
		for (let i = row - offset(m); i <= row + offset(m); ++i) {
			for (let j = col - offset(n); j <= col + offset(n); ++j) {
				if ((i < 0 || j < 0) || (i > height || j > width)) {
					// @Note: this is like a zero padding
					buffer.push(0);
				} else {
					const index = j * 4 + (i * width * 4);
					buffer.push(pixelData[index]);
				}
			}
		}

		buffer.sort((a, b) => { return a - b; });
		const medPos = (m * n + 1) / 2;
		return buffer[medPos - 1];
	}

	function handleButtonShowHideGrayImageFiltered() {
		const state = elButtonShowOrHideTableGrayImageFiltered.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueImageGrayFiltered.parentElement.style.display = "table";
		} else {
			elTBodyValueImageGrayFiltered.parentElement.style.display = "none";
		}

		elButtonShowOrHideTableGrayImageFiltered.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function handleButtonShowHideGrayImage() {
		const state = elButtonShowOrHideTableGrayImage.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueInputImageGray.parentElement.style.display = "table";
		} else {
			elTBodyValueInputImageGray.parentElement.style.display = "none";
		}

		elButtonShowOrHideTableGrayImage.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function handleButtonShowHideRTableInputImage() {
		const state = elButtonShowOrHideRTableInputImage.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueInputImageR.parentElement.style.display = "table";
		} else {
			elTBodyValueInputImageR.parentElement.style.display = "none";
		}

		elButtonShowOrHideRTableInputImage.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function handleButtonShowHideGTableInputImage() {
		const state = elButtonShowOrHideGTableInputImage.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueInputImageG.parentElement.style.display = "table";
		} else {
			elTBodyValueInputImageG.parentElement.style.display = "none";
		}

		elButtonShowOrHideGTableInputImage.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function handleButtonShowHideBTableInputImage() {
		const state = elButtonShowOrHideBTableInputImage.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueInputImageB.parentElement.style.display = "table";
		} else {
			elTBodyValueInputImageB.parentElement.style.display = "none";
		}

		elButtonShowOrHideBTableInputImage.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function handleButtonShowHidImageeMonochrome() {
		const state = elButtonShowOrHideTableMonochrome.innerHTML;

		if (state == "Tampilkan") {
			elTBodyValueImageMonochrome.parentElement.style.display = "table";
		} else {
			elTBodyValueImageMonochrome.parentElement.style.display = "none";
		}

		elButtonShowOrHideTableMonochrome.innerHTML = state == "Tampilkan" ? "Sembunyikan" : "Tampilkan";
	}

	function getHistValuesFromImageData(data) {
		let rTable = new Array(256).fill(0);
		let gTable = new Array(256).fill(0);
		let bTable = new Array(256).fill(0);

		for (let i = 0; i < data.length; i += 4) {
			const r = data[i + 0];
			const g = data[i + 1];
			const b = data[i + 2];

			++rTable[r];
			++gTable[g];
			++bTable[b];
		}

		return [
			rTable,
			gTable,
			bTable,
		];
	}

	function renderHistogramOnCanvas(ctxCanvas, histValues, isMonochrome = false) {
		function getMaxValueFromHistValues(histVals) {
			let max = 0;
			for (let i = 0; i < histVals.length; ++i) {
				const val = histVals[i];
				if (val > max) {
					max = val;
				}
			}
			return max;
		}

		let height = 250;
		let width = 560;

		const marginBottom = 24;
		let marginLeft = 36;
		if (isMonochrome) marginLeft = 64; // increase margin in monochrome hisrogram
		const fontPx = 12;
		let availableSpaceAdder = 32;

		ctxCanvas.lineWidth = 1;
		ctxCanvas.strokeStyle = "black";
		ctxCanvas.font = "12px 'Computer Modern Serif'";
		ctxCanvas.moveTo(marginLeft, 0);
		ctxCanvas.lineTo(marginLeft, height - marginBottom + availableSpaceAdder);
		ctxCanvas.lineTo(width - 2, height - marginBottom + availableSpaceAdder);

		const maxValue = getMaxValueFromHistValues(histValues);
		const lineValueCount = 6;
		const aspect = height / maxValue;

		for (let i = 0; i < lineValueCount; ++i) {
			const v = (i * (maxValue / (lineValueCount - 1))).toFixed(1);
			const y = height - (marginBottom - 5 + (v * aspect));
			ctxCanvas.fillText(`${v}`, 0, y + availableSpaceAdder);
		}

		if (isMonochrome) {

			for (let index = 0; index < 2; ++index) {
				let value = histValues[index * 255];
				if (value == 255) value = 1;

				ctxCanvas.moveTo(8 + marginLeft + 100 * index, height - marginBottom + availableSpaceAdder);
				ctxCanvas.lineTo(8 + marginLeft + 100 * index, height - marginBottom - (value * aspect) + availableSpaceAdder);

				const val = `${index}`;
				ctxCanvas.fillText(val, 8 + marginLeft + 100 * index - (val.length * fontPx * 0.5) / 2, height - 4 + availableSpaceAdder);
			}
		} else {
			for (let index = 0; index < 256; ++index) {
				let value = histValues[index];

				ctxCanvas.moveTo(8 + marginLeft + 2 * index, height - marginBottom + availableSpaceAdder);
				ctxCanvas.lineTo(8 + marginLeft + 2 * index, height - marginBottom - (value * aspect) + availableSpaceAdder);

				if (index % 50 == 0) {
					const val = `${index}`;
					ctxCanvas.fillText(val, 8 + marginLeft + 2 * index - (val.length * fontPx * 0.5) / 2, height - 4 + availableSpaceAdder);
				}
			}

		}
		ctxCanvas.stroke();
	}


	function renderImageValueOnTable(elTable, data, indexOffset, width, height, topLeftText = "", isMonochrome = false) {
		let cValue = "";

		for (let row = 0; row < height; ++row) {
			cValue += "<tr>";

			if (row === 0) {
				cValue += `<td>${topLeftText}</td>`;
				for (let col = 0; col < width; ++col) {
					cValue += `<td>${col}</td>`;
				}
				cValue += `</tr><tr>`;
			}

			cValue += `<td>${row}</td>`;

			for (let col = 0; col < width; ++col) {
				const index = col * 4 + (row * width * 4);
				let c = data[index + indexOffset];
				if (isMonochrome) {
					if (c == 255) c = 1;
				}
				cValue += `<td>${c}</td>`;
			}
			cValue += "</tr>";
		}

		elTable.innerHTML = cValue;
	}
};