

const MAX_ITER_COUNT_HIT = 0;
const ROOT_FOUND = 1;
const B_MINUS_A = 2;
const MIDPOINT_INTERVAL = 3;
const F_P_LESS = 4;

//=================================
//  Termination Condition Checker
//=================================
function checkBracketedTerminate(a, b, prevp, p, fp, tolerance) {
    if (fp === 0) return ROOT_FOUND;
    if (Math.abs(b - a) < tolerance) return B_MINUS_A;
    if (Math.abs(p - prevp) < tolerance) return MIDPOINT_INTERVAL;
    if (Math.abs(fp) < tolerance) return F_P_LESS;
    return null;
}


function checkOpenTerminate(prevp, p, fp, tolerance) {
    if (fp === 0) return ROOT_FOUND;
    if (Math.abs(p - prevp) < tolerance) return B_MINUS_A;
    if (Math.abs(fp) < tolerance) return F_P_LESS;
    return null;
}


//=======================
// Bisection Method
//=======================
function bisection(expr, a, b, tolerance, precision, maxiter, callback) {
    //  Preloop Test - Test if is valid a and b
    const e1 = expr.evaluate({x:a});
    const e2 = expr.evaluate({x:b});
    if ((e1 < 0) && (e2 < 0) || (e1 > 0) && (e2 > 0))
        throw "Bisection: Initial values a,b must have f(a) and f(b) to have different signs!";
    
    a = math.round(a, precision);
    b = math.round(b, precision);
    let previousMid = b;

    //  Root is either a or b
    if (e1 === 0) return { ans: a, end: ROOT_FOUND};
    else if (e2 === 0) return { ans: b, end: ROOT_FOUND};

    //  Iteration
    for (let i = 1; i <= maxiter; ++i) {
        const fa = math.round( expr.evaluate({x: a}), precision);
        const fb = math.round( expr.evaluate({x: b}), precision);

        const p = math.round( math.round( (a + b) / 2, precision+1), precision );
        const fp = math.round( expr.evaluate({x: p}), precision);

        callback([i, a, b, fa, fb, p, fp]);

        //  Check for terminate conditions
        const terminateCondition = checkBracketedTerminate(a,b,previousMid,p,fp,tolerance);
        if (terminateCondition !== null)
            return { ans: p, end: terminateCondition };

        // Prepare for next iteration
        if (fa < 0 && fp > 0 || fa > 0 && fp < 0) b = p;
        else a = p;
        previousMid = p;
    }
    return { ans: previousMid, end: MAX_ITER_COUNT_HIT};
}


//=======================
//  False Position Method
//=======================
function falsePosition(expr, a, b, tolerance, precision, maxiter, callback) {
    //  Preloop Test
    //  Test if is valid a and b
    const e1 = expr.evaluate({x:a});
    const e2 = expr.evaluate({x:b});
    if ((e1 < 0) && (e2 < 0) || (e1 > 0) && (e2 > 0))
        throw "Bisection: Initial values a,b must have f(a) and f(b) to have different signs!";
    
    a = math.round(a, precision);
    b = math.round(b, precision);
    let previousMid = b;

    //  Root is either a or b
    if (e1 === 0) return { ans: a, end: ROOT_FOUND};
    else if (e2 === 0) return { ans: b, end: ROOT_FOUND};

    //  Iteration
    for (let i = 1; i <= maxiter; ++i) {
        const fa = math.round( expr.evaluate({x: a}), precision);
        const fb = math.round( expr.evaluate({x: b}), precision);

        const p = math.round( (a * fb - b * fa) / (fb - fa), precision );
        const fp = math.round( expr.evaluate({x: p}), precision);

        callback([i, a, b, fa, fb, p, fp]);

        //  Check for terminate conditions
        const terminateCondition = checkBracketedTerminate(a,b,previousMid,p,fp,tolerance);
        if (terminateCondition !== null)
            return { ans: p, end: terminateCondition };

        // Prepare for next iteration
        if (fa < 0 && fp > 0 || fa > 0 && fp < 0) b = p;
        else a = p;
        previousMid = p;
    }
    return { ans: previousMid, end: MAX_ITER_COUNT_HIT};
}



//=======================
//  Secant Method
//=======================
function secantMethod(expr, a, b, tolerance, precision, maxiter, callback) {
    //  Preloop Test
    //  Test if is valid a and b
    const e1 = expr.evaluate({x:a});
    const e2 = expr.evaluate({x:b});

    a = math.round(a, precision);
    b = math.round(b, precision);

    //  Root is either a or b
    if (e1 === 0) return {ans: a, end: ROOT_FOUND};
    else if (e2 === 0) return {ans: b, end: ROOT_FOUND};

    //  Iteration
    for (let i = 1; i <= maxiter; ++i) {
        const fa = math.round( expr.evaluate({x: a}), precision);
        const fb = math.round( expr.evaluate({x: b}), precision);

        const p = math.round( (a * fb - b * fa) / (fb - fa), precision );
        const fp = math.round( expr.evaluate({x: p}), precision);

        callback([i, a, b, fa, fb, p, fp]);

        //  Check for terminate conditions
        const terminateCondition = checkOpenTerminate(b, p, fp, tolerance);
        if (terminateCondition !== null)
            return { ans: p, end: terminateCondition };

        // Prepare for next iteration
        a = b; b = p;
    }
    return { ans: b, end: MAX_ITER_COUNT_HIT};
}


//=======================
//  Newton's Method
//=======================
function newton(expr, a, tolerance, precision, maxiter, callback) {
    //  Preloop Test
    //  Test if is valid a and b
    const e1 = expr.evaluate({x:a});
    a = math.round(a, precision);
    if (e1 === 0) return { ans: a, end: ROOT_FOUND};

    const ddx = math.derivative(expr, 'x');

    //  Iteration
    for (let i = 1; i <= maxiter; ++i) {
        const fa = math.round(expr.evaluate({x: a}), precision);
        const fprimea = math.round(ddx.evaluate({x: a}), precision);
        const p = math.round(a - (fa / fprimea), precision);
        const fp = math.round(expr.evaluate({x: p}), precision );

        callback([i, a, fa, fprimea, p, fp]);

        //  Check for terminate conditions
        const terminateCondition = checkOpenTerminate(a, p, fp, tolerance);
        if (terminateCondition !== null)
            return { ans: math.round(p, precision+1), end: terminateCondition };

        // Prepare for next iteration
        a = p;
    }
    return {ans: a, end: MAX_ITER_COUNT_HIT};
}