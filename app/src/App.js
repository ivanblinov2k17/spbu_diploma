import './App.css';
import pixels from 'image-pixels';
import {Image} from 'image-js';
import { useRef, useState} from 'react';
import { encrypt } from './main';
function App() {
  const [imageData, setImageData] = useState(undefined);
  const [imageFile, setImageFile] = useState(null);
  const [sharesNum, setSharesNum] = useState(3);
  const [shares, setShares] = useState([]);
  const [threshold, setThreshold] = useState(2);
  const [covers, setCovers] = useState([]);
  const [coversByte, setCoversByte] = useState([]);
  const [submited, setSubmited] = useState(false);
  const imageRef = useRef(null);
  const coversRef = useRef([])
  
  const onSecretChange = (e) => {
    setImageFile(URL.createObjectURL(e.target.files?.[0]));
  }
  const onSecretLoaded = async () => {
    if(!imageData){
      const {data, width, height} = await pixels(imageRef.current);
      const grayscaleData = rgbaToGrayscale(data)
      let greySecret = new Image(
        {width, height, data: grayscaleData, kind: 'GREY'}
      );
      setImageFile(greySecret.toDataURL())
      setImageData({grayscaleData, width, height})
    }
  }

  const sharesChange = (e) => {
    setSharesNum(e.target.value)
  }

  const onCoverChange = (e, index)=>{
    const tempCovers = [...covers]
    tempCovers[index] = URL.createObjectURL(e.target.files?.[0]);
    setCovers(tempCovers)  
  }

  const onCoverLoaded = async (e, index)=>{
    if(!coversByte[index]){
      const tempCovers = [...covers]
       
      const tempCoversByte = [...coversByte]
      const image = await Image.load(coversRef.current[index]?.src)

      const binaryData = greyToBinary(image.grey().data)
      
      const size = Math.round(Math.sqrt(binaryData.length))
      const binary = new Image({
        height: size,
        width: size,
        data: binaryData.map(pixel => pixel ? 255 : 0), kind: "GREY", })
      //shan
      tempCoversByte[index] = binaryData

      tempCovers[index] = binary.toDataURL();
    
      setCovers(tempCovers)
      setCoversByte(tempCoversByte)
    }
  }

  
  const onSubmitClick = () => {
    const result = encrypt(sharesNum, threshold, imageData.grayscaleData, coversByte) 
    const mCoversImages = result.modifiedCovers.map((cover)=>{
      const size = Math.round(Math.sqrt(cover.length));
      debugger;
      return new Image(({height: size, width: size, data: cover, kind: "GREY"}))
    })
    const modifiedCovers = mCoversImages.map(m=>m.toDataURL())
    setShares(modifiedCovers)//change on result
    setSubmited(true);
  }

  // luminosityMethod
  const rgbaToGrayscale = (rgbPixels) => {
    const grayscaleImage = [];

    for (let i = 0; i < rgbPixels.length; i=i+4) {
      const pixel = 0.3*rgbPixels[i] + 0.59*rgbPixels[i+1] + 0.11*rgbPixels[i+2]
      grayscaleImage.push(Math.round(pixel))
    }
    return grayscaleImage
  }

  const greyToBinary = (greyPixels) => {
    return greyPixels.map((pixel)=>{
      return pixel > 127 ? 1 : 0;
    })
  }
  
  return (
    <div className="App">
      <div className='secret'>
        <div>
          Open secret image
        </div>
        <input type="file" accept="image/png" onChange={onSecretChange}></input>
        <img src={imageFile}  onLoad={onSecretLoaded} height="512px" width="512px" alt='secret' ref={imageRef}></img>
        Grayscaled Secret:
        <img></img>
      </div>

      <div className='scheme'>
        Enter shares number (3 - 6)
        <input type="number" value={sharesNum} onChange={sharesChange} max="10" min="3"></input>

        Enter threshold value (2 - 5)
        <input type="number" value={threshold} onChange={(e)=>{setThreshold(e.target.value)}} max="9" min="2"></input>
      </div>
      {imageData && sharesNum 
      ? <CoversComponent {...{sharesNum, covers, coversRef, onCoverChange, onCoverLoaded}}/> : ''}

      <button onClick={onSubmitClick}>Generate Shares</button>
      {submited && <SharesComponent {...{sharesNum, shares}}/>}

    </div>
  );
}


function CoversComponent(props){
  const {sharesNum, covers, coversRef, onCoverChange, onCoverLoaded} = props

  return <div className='covers'> 
  {
  Array(parseInt(sharesNum)).fill(undefined).map((_, index)=>{
    return <div key={index}>
      Cover Image for share {index}
      <input type="file" accept="image/png" onChange={(e)=>onCoverChange(e, index)}></input>
      <img src={covers?.[index]} height="512px" width="512px" 
        onLoad={(e)=>onCoverLoaded(e, index)} alt={`cover_${index}`} ref={(el) => coversRef.current[index] = el}></img>
    </div>
    })
  }</div>
}

function SharesComponent(props){
  const {sharesNum, shares} = props

  return <div> 
  {
  Array(parseInt(sharesNum)).fill(undefined).map((_, index)=>{
    return <div key={index}>
      Share {index}
      <img src={shares?.[index]} height="512px" width="512px" 
        alt={`share_${index}`}></img>
    </div>
    })
  }</div>
}




export default App;
