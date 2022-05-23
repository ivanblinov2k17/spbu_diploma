import {Image} from "image-js"

let secretImage = {};
let coverImages = [[], [], [], []];
const greyToBinary = (greyPixels) => {
    return greyPixels.map((pixel)=>{
      return pixel > 127 ? 1 : 0;
    })
  }

const rgbaToGrayscale = (rgbPixels) => {
    const grayscaleImage = [];

    for (let i = 0; i < rgbPixels.length; i=i+4) {
        const pixel = 0.3*rgbPixels[i] + 0.59*rgbPixels[i+1] + 0.11*rgbPixels[i+2]
        grayscaleImage.push(Math.round(pixel))
    }
    return grayscaleImage
}
Image.load('images/pepper256.png').then(function (image) {
    secretImage = image.data
});
Image.load('images/cover1.png').then(function(image){
    coverImages[0] = greyToBinary(image.data)
    console.log(coverImages[0])
});