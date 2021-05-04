//===============================
// Particle js
//===============================
Particles.init({
    selector: ".background__canvas",
    maxParticles: 80,
    connectParticles: true,
    sizeVariations: 8,
    color: '#ecf0f1',
    responsive: [{
        breakpoint: 768,
        options: {
            maxParticles: 30
        }
    }]
});

//=================================
//  Components
//=================================
const htmlForm = document.getElementById('input--form');

const htmlTypeInput = document.getElementById('input--type__value');
const htmlFunctionInput = document.getElementById('input--func__value');
const htmlLatexOutput = document.getElementById('input--func__latex');

const htmlValue1Input = document.getElementById('input--bound__value1');
const htmlValue2Input = document.getElementById('input--bound__value2');

const htmlPrecisionInput = document.getElementById('input--precision__preval');
const htmlToleranceInput = document.getElementById('input--precision__tolerance');
const htmlMaxIterInput = document.getElementById('input--maxiter__value');

const htmlTableHead = document.getElementById('table--head');
const htmlTableBody = document.getElementById('table--body');

const htmlAnsOutput = document.getElementById('result--ans--ans');
const htmlTerminationOutput = document.getElementById('result--ans--termination');


//=======================================
//  Change to Appropriate Table header
//=======================================
const bracketedMethodHeaderHTML = `
<tr>
    <th>$$i$$</th>
    <th>$$a$$</th>
    <th>$$b$$</th>
    <th>$$f(a)$$</th>
    <th>$$f(b)$$</th>
    <th>$$p$$</th>
    <th>$$f(p)$$</th>
<tr>
`;
const secantMethodHeaderHTML = `
<tr>
    <th>$$i$$</th>
    <th>$$p_{i-1}$$</th>
    <th>$$p_i$$</th>
    <th>$$f(p_{i-1})$$</th>
    <th>$$f(p_{i})$$</th>
    <th>$$p_{i+1}$$</th>
    <th>$$f(p_{i+1})$$</th>
<tr>
`;
const newtonMethodHeaderHTML = `
<tr>
    <th>$$i$$</th>
    <th>$$x_i$$</th>
    <th>$$f(x_i)$$</th>
    <th>$$f'(x_i)$$</th>
    <th>$$x_{i+1}$$</th>
    <th>$$f(x_{i+1})$$</th>
<tr>
`;


function changeTableHeader(type) {
    switch (type) {
        case "bisection":
        case "false-position":
            htmlTableHead.innerHTML = bracketedMethodHeaderHTML;
            break;
        case "secant":
            htmlTableHead.innerHTML = secantMethodHeaderHTML;
            break;
        case "newton":
            htmlTableHead.innerHTML = newtonMethodHeaderHTML;
    }
    MathJax.typeset();
}

htmlTypeInput.onchange = ()=> changeTableHeader(htmlTypeInput.value);


//=================================
//  Equation Rendering in Latex
//=================================
//  MathJAX showing math formulae
function reparseMathJAX() {
    try {
        const expr = math.parse(htmlFunctionInput.value);
        htmlLatexOutput.innerHTML = `$$${expr.toTex()}$$`;
        MathJax.typeset();
    } catch (e) {}
}

htmlFunctionInput.addEventListener('input', reparseMathJAX);

//================================
//  Precision Correcting
//================================
function correctPrecision() {
    let precision = Number.parseInt(htmlPrecisionInput.value);
    if (!Number.isInteger(precision) || precision < 0) return;

    const dp = math.round( Math.pow(10, -precision) / 2.0, precision+1 );
    htmlToleranceInput.value = dp;
}

htmlPrecisionInput.addEventListener('input', correctPrecision);




//================================
//  Evaluate and append to table
//================================
//  Feature to add rows on an interval
const queueToAppend = []
let intervalTimer = null;

function appendRow(row) {
    let datahtml = ``;
    for (const v of row)
        datahtml += `<td>${v}</td>`;

    const rowNode = document.createElement('tr');
    rowNode.className = 'slidein';
    rowNode.innerHTML = datahtml;

    queueToAppend.push(rowNode);

    if (intervalTimer === null) {
        intervalTimer = setInterval(() => {
            htmlTableBody.appendChild(queueToAppend.shift() );
            if (queueToAppend.length === 0) {
                clearInterval(intervalTimer);
                intervalTimer = null;
            }
        }, 250);
    }
}



function evaluate() {
    const type = htmlTypeInput.value;
    let func = htmlFunctionInput.value;
    let x0 = htmlValue1Input.value;
    let x1 = htmlValue2Input.value;
    let precision = htmlPrecisionInput.value;
    let error = htmlToleranceInput.value;
    let maxiter = htmlMaxIterInput.value;

    //  Validation of f(x)
    try {
        func = math.parse(func);
        const t = func.evaluate({x: 1});
        if (typeof(t) !== 'number') throw "Not a x variable function";
    } catch(e) {
        window.alert("Error found while validating f(x). Perhaps check your function f(x)? It must be an univariate function of x\n\n" + e);
        return;
    }

    //  Validation of x0, x1
    [x0, x1] = [parseFloat(x0), parseFloat(x1)];
    if ( isNaN(x0) || (type !== 'newton' && isNaN(x1) ) ) {
        window.alert("Error found while validating x0 or x1. Perhaps check the input values?");
        return;
    }

    //  Validation of precision
    precision = parseFloat(precision);
    if ( isNaN(precision) || Math.round(precision) !== precision || precision < 0 || precision > 12) {
        window.alert("Error found while validating precision. Ensure that precision is natural number and (0 <= N <= 12)?");
        return;
    }

    //  Validation of error / tolerance
    error = parseFloat(error);
    if ( isNaN(error) || error < 0 ) {
        window.alert("Error found while validating tolerance. Perhaps check the tolerance value?");
        return;
    }

    //  Validation of precision
    maxiter = parseFloat(maxiter);
    if ( isNaN(maxiter) || Math.round(maxiter) !== maxiter || maxiter < 1 || maxiter > 1000) {
        window.alert("Error found while validating iteration number. Ensure that iteration number is natural number and (1 <= N <= 1000)?");
        return;
    }

    htmlTableBody.innerHTML = '';

    let res = null;
    htmlTableHead.scrollIntoView(true);
    try {
        if (type === 'bisection') res = bisection(func, x0, x1, error, precision, maxiter, appendRow);
        else if (type === 'false-position') res = falsePosition(func, x0, x1, error, precision, maxiter, appendRow);
        else if (type === 'secant') res = secantMethod(func, x0, x1, error, precision, maxiter, appendRow);
        else res = newton(func, x0, error, precision, maxiter, appendRow);
    } catch (e) {
        window.alert("Error: " + e);
        return;
    }

    htmlAnsOutput.innerHTML = `= ${res.ans} <br>= ${math.round(res.ans, precision)} (Rounded to ${precision} d.p)`;

    let o;
    if (res.end === MAX_ITER_COUNT_HIT) o = 'Maximum Iteration Count Reached';
    else if (res.end === ROOT_FOUND) o = 'Exact Root is Found!$$f(p) = 0$$';
    else if (res.end === B_MINUS_A) o = 'Condition 1: $$|b - a| < ε$$';
    else if (res.end === MIDPOINT_INTERVAL) o = 'Condition 2: $$|m_N - m_{N-1}| < ε$$';
    else o = 'Condition 3: $$|f(p)| < ε$$';
    htmlTerminationOutput.innerHTML = o;

    MathJax.typeset();
}


htmlForm.onsubmit = (e)=> {
    e.preventDefault();
    evaluate();
}