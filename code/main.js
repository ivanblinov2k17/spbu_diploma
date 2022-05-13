import gcd from "compute-gcd"
import Big from "big.js"

// STEP 1 encoding
const primeNumberList = [
    131, 137, 139, 149,
    151, 157, 163, 167, 
    173, 179, 181, 191, 
    193, 197, 199, 211, 
    223]

const shares = 5
const threshold = 3
// const p = primeNumberList[Math.floor(Math.random()*primeNumberList.length)]
const p = 131
console.log(p, 'p')
// let m = []
// for (let i = p+1; i <= 256; i++) {
//     let suitable = true;
//     m.forEach((mi)=>{
//         if (gcd(i, mi)!=1) {
//             suitable = false
//         }
//     })
//     if(suitable){
//         m.push(i)
//     }    
// }
let m = [247,251,253,254,255]
let M = Big(1)
m = m.slice(-shares)
console.log(m, 'mi array')

const m_thresh = m.slice(-threshold)
m_thresh.forEach((mi) => M = M.times(mi))
console.log(M.toString(), 'M')

let N = Big(1)
// m_thresh.forEach(mi => N = N.times(mi))
for (let i = 1; i < threshold; i++) {
    N = N.times(m[shares-i])  
}
console.log(N.toString(), 'N')

console.log(N.times(p).toString(), 'nmultp')
console.log(M.minus(N.times(p)).toString(), 'equasion1')

if (M.lt(N.times(p))){
    throw new Error('Step 1 requirement is not passed please pick other (k,n values)');
}

// STEP 2 encoding
const T = M.div(p).minus(1).round(undefined, Big.roundDown).div(2).round()
console.log(T.toString(), 'T')
// STEPS 3-5
const secretPixels = [255, 125, 148, 200]


function q (ai, THi0, THi1, ci){
    if(ci==1 && ai>=THi1){
        return true
    }
    if (ci ==0 && ai<THi0){
        return true
    }
    return false
}
const TH = 64;
const covers = [[0,1,0,1],[1,0,1,0],[1,0,0,0],[0,0,1,0],[0,0,0,1]]
const modifiedCovers = [[],[],[],[],[]]
secretPixels.forEach((x, sindex)=>{
    let A = 0;
    let y = 0;
    let qcond = false;
    while(!qcond){
        const qcondarr = []
        if (x>=0 && x<p){
            const rightBound = M.div(p).minus(1).round(undefined, Big.roundDown)
            const leftBound = T.plus(1)
            const difference = rightBound.minus(leftBound)
            A = difference.times(Math.random()).round().plus(leftBound)
            y = A.times(p).plus(x)
        }
        else {
            A = T.times(Math.random()).round()
            y = A.times(p).plus(x).minus(p)
        }
        m.forEach((mi, index) => {      
            const THi0 = mi/2 - TH 
            const THi1 = mi/2 + TH
            const ai = y.mod(mi)
            qcondarr.push(q(ai, THi0, THi1, covers[index][sindex]))
        })
        if (!qcondarr.includes(false)){
            qcond = true
        }
    }
    m.forEach((mi, index) => {
        modifiedCovers[index][sindex] = y.mod(mi)
    })
    
})
console.log(modifiedCovers.map(c=>c.toString()), 'modified covers')
// recovering process
const coversRecovered = [[],[],[],[],[]]
// reconstructing covers
modifiedCovers.forEach((mc, mcindex)=>{
    const binThreshold = m[mcindex]/2
    mc.forEach((mcp, mcpindex)=>{
        coversRecovered[mcindex][mcpindex] = mcp >= binThreshold ? 1 : 0
    })
})
console.log(coversRecovered, 'coversRecovered')
// reconstructing secret
function inverse(a, n){
    let t = new Big(0);     
    let newt = new Big(1);
    let r = new Big(n);     
    let newr = new Big(a);

    while (!newr.eq(0)){
        let quotient = r.div(newr).round(undefined, Big.roundDown);
        let temp = newt;
        newt = t.minus(quotient.times(newt));
        t = temp;
        // (t, newt) = (newt, t - quotient * newt) 
        temp = newr;
        newr = r.minus(quotient.times(newr));
        r = temp;
        // (r, newr) = (newr, r - quotient * newr)
    }
    if (r.gt(1))
        return "is not inversible"
    if (t.lt(0)) 
        t = t.plus(n)
    return t
}
const secretLen = modifiedCovers[0].length
const secretRecovered = []
const modifiedThresh = modifiedCovers.slice(0, threshold);
for (let i=0; i < secretLen; i++){
    let CRT = []
    modifiedThresh.forEach((mCov, index)=>{
        CRT.push({ai: mCov[i], mi: m[index]})
    })
    let _M = Big(1);
    CRT.forEach((eq)=>{
        _M = _M.times(eq.mi)
    })
    CRT = CRT.map((eq)=>{
        const Mi = _M.div(eq.mi)
        return {...eq, Mi, MiInv: inverse(Mi, eq.mi)}
    })
    // up here right
    let y = Big(0);
    CRT.forEach((eq)=>{
        y = y.plus(eq.ai.times(eq.Mi).times(eq.MiInv)).mod(_M)
    })
    y = y.mod(_M)
    console.log(y.toString(), 'CRT answer')
    const _T = y.div(p).round(undefined, Big.roundDown)
    let x = 0;
    if (_T.gte(T)){
        x = y.mod(p)
    }
    else {
        x = y.mod(p).plus(p)
    }
    secretRecovered.push(x)
}
console.log(secretRecovered.map(s=>s.toString()))
console.log(secretPixels)