import './App.css';
import pixels from 'image-pixels';
import {forwardRef, useEffect, useRef, useState} from 'react';
function App() {
  const [imageData, setImageData] = useState(undefined);
  const [imageFile, setImageFile] = useState(null);
  const [sharesNum, setSharesNum] = useState(5);
  const [shares, setShares] = useState([]);
  const [threshold, setThreshold] = useState(3);
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
      console.log(data)
      setImageData({data, width, height})
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
      const tempCoversByte = [...coversByte]
      const {data, width, height} = await pixels(imageRef.current);
      tempCoversByte[index] = {data, width, height}
      setCoversByte(tempCoversByte)
    }
  }

  const onSubmitClick = () => {
    setShares(covers)//change on result
    setSubmited(true);
  }
  
  return (
    <div className="App">
      <div className='secret'>
        <div>
          Open secret image
        </div>
        <input type="file" accept="image/png" onChange={onSecretChange}></input>
        <img src={imageFile}  onLoad={onSecretLoaded} height="512px" width="512px" alt='secret' ref={imageRef}></img>
        
      </div>

      <div className='scheme'>
        Enter shares number (3 - 10)
        <input type="number" value={sharesNum} onChange={sharesChange} max="10" min="3"></input>

        Enter threshold value (2 - 9)
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
