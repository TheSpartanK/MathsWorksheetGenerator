const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


// SINGLE SOURCE OF TRUTH: All updated formulas mapping proper descriptions, questions, and precise answer strings
const questionTypes = [
        {
            id: 'add2d',
            label: 'Addition - 2-Digit (e.g., 45 + 23)',
            description: 'Generates arithmetic addition logic using two independent double-digit integer variables spanning 10 to 89.',
            answerFormat: 'decimal',
            enabled: false,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * 80) + 10;
                const num2 = Math.floor(Math.random() * 80) + 10;
                return { question: `${num1} + ${num2} = `, answer: (num1 + num2).toString() };
            }
        },
        {
            id: 'add4d',
            label: 'Addition - 4-Digit Addition (e.g., 4536 + 1979)',
            description: 'Calculates high-range sum expressions utilizing two 4-digit positive integers between 400 and 9999.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * (9999 - 400 + 1)) + 400;
                const num2 = Math.floor(Math.random() * (9999 - 400 + 1)) + 400;
                return { question: `${num1} + ${num2} = `, answer: (num1 + num2).toString() };
            }
        },
    {
        id: 'sub-1d',
        category: 'Subtraction', // Row Group identifier
        level: 1,                 // Sequential Level identifier
        label: 'Level 1 (9 - 6)', // Short display label for the checkbox block
        description: 'Single digit (0-10) non-negative subtraction calculations.',
        enabled: true,
        defaultChecked: false,
        answerFormat: 'decimal',
        generate: () => {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * num1);
            return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
        }
    },
    {
        id: 'sub-2d-a',
        category: 'Subtraction',
        level: 2,             
        label: 'Level 2 (16 - 9)', 
        description: 'Numbers 0-20 non-negative subtraction calculations.',
        enabled: true,
        defaultChecked: false,
        answerFormat: 'decimal',
        generate: () => {
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * num1);
            return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
        }
    },

    {
        id: 'sub2d-no-borrow',
        category: 'Subtraction',
        level: 3, // Adjust level sequence integer as needed
        label: 'Level 3 (2-Digit No Borrowing)',
        description: 'Two-digit subtraction specifically constrained so that the units digit of Y is less than or equal to X, avoiding any mental carrying operations.',
        answerFormat: 'decimal',
        enabled: true,
        defaultChecked: false,
        generate: () => {
//            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

            // 1. Break X down into tens and units components within its boundary
            const xTens = rand(1, 9);
            const xUnits = rand(0, 9);

            // Construct final X. If tens is 1 and units is 0, it would be 10. 
            // We bump it to 11 to respect your "11-99" boundary rule.
            let num1 = (xTens * 10) + xUnits;
            if (num1 === 10) {
                return this.generate(); // Clean tail recursion fallback for safety
            }

            // 2. Generate Y components constrained to never exceed X components
            const yTens = rand(0, xTens); // Tens can be 0 (making Y a 1-digit number) up to xTens
            const yUnits = rand(0, xUnits); // Units digit of Y MUST be <= units digit of X

            const num2 = (yTens * 10) + yUnits;

            // 3. Final safety boundary validation step
            // Ensure we don't output "25 - 0 = " if yTens and yUnits both roll 0, making Y at least 1
            if (num2 === 0 || num1 === num2) {
                // Force a quick reroll to ensure Y is at least 1 and strictly smaller than X
                const fallbackUnits = xUnits === 0 ? 0 : rand(1, xUnits);
                const finalNum2 = num2 === 0 ? fallbackUnits || 1 : num2 - 1; 

                // Simple absolute math recheck bypass
                return {
                    question: `${num1} - ${finalNum2 || 1} = `,
                    answer: (num1 - (finalNum2 || 1)).toString()
                };
            }

            return { 
                question: `${num1} - ${num2} = `, 
                answer: (num1 - num2).toString() 
            };
        }
    },    {
        id: 'sub2d-no-borrow',
        category: 'Subtraction',
        level: 3, 
        label: 'Level 3 (2-Digit No Borrowing)',
        description: 'Two-digit subtraction specifically constrained so that the units digit of Y is less than or equal to X, avoiding any mental carrying operations.',
        answerFormat: 'decimal',
        enabled: true,
        defaultChecked: false,
        generate: () => {
//            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

            // Infinite loop allows safe mathematical re-rolls
            while (true) {
                const xTens = rand(1, 9);
                const xUnits = rand(0, 9);

                let num1 = (xTens * 10) + xUnits;
                if (num1 === 10) {
                    continue; // Safe re-roll transition
                }

                const yTens = rand(0, xTens); 
                const yUnits = rand(0, xUnits); 

                const num2 = (yTens * 10) + yUnits;

                if (num2 === 0 || num1 === num2) {
                    const fallbackUnits = xUnits === 0 ? 0 : rand(1, xUnits);
                    const finalNum2 = num2 === 0 ? fallbackUnits || 1 : num2 - 1; 

                    return {
                        question: `${num1} - ${finalNum2 || 1} = `,
                        answer: (num1 - (finalNum2 || 1)).toString()
                    };
                }

                return { 
                    question: `${num1} - ${num2} = `, 
                    answer: (num1 - num2).toString() 
                };
            }
        }
    },

        {
        id: 'sub2d-with-borrow',
        category: 'Subtraction',
        level: 4, 
        label: 'Level 4 (2-Digit with Borrowing)',
        description: 'Two-digit subtraction (11 to 99) explicitly constrained so that the units digit of Y is strictly greater than the units digit of X, forcing a mental borrowing step.',
        answerFormat: 'decimal',
        enabled: true,
        defaultChecked: false,
        generate: () => {
//            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

            // 1. Roll the units digits first to guarantee a borrow condition
            // xUnits must be less than yUnits, so xUnits ranges 0-8 and yUnits ranges (xUnits + 1)-9
            const xUnits = rand(0, 8);
            const yUnits = rand(xUnits + 1, 9);

            // 2. Roll the tens digits
            // To keep X within 11-99, xTens can range from 1 to 9.
            // Since we must have X > Y, yTens can go from 0 up to (xTens - 1).
            // (If yTens is 0, Y becomes a clean 1-digit number like 75 - 8, which still requires borrowing!)
            const xTens = rand(1, 9);
            const yTens = rand(0, xTens - 1);

            const num1 = (xTens * 10) + xUnits;
            const num2 = (yTens * 10) + yUnits;

            // 3. Simple edge case safeguard
            // If xTens was 1 and yTens rolled 0, num1 is between 10-18. 
            // If num1 rolls exactly 10, a borrow is impossible (since xUnits would be 0, but yUnits can't be greater than 9).
            // Our xUnits maximum condition above naturally blocks this, but we filter if num1 < num2 due to extreme rolls.
            if (num1 <= num2 || num1 < 11) {
                // If an absolute bounds collision happens, force a standard clean borrow setup (e.g., 52 - 38)
                return {
                    question: "52 - 38 = ",
                    answer: "14"
                };
            }

            return { 
                question: `${num1} - ${num2} = `, 
                answer: (num1 - num2).toString() 
            };
        }
    },
// Notes for AI: For the remaining subtraction levels we'll do
// 5: 3 digit, no negative answers, no borrow on 10s or units
// 6: 3 digit, no negative answers, no borrow on 10s, only with borrow on units
// 7: 3 digit, no negative answers, only with borrow on 10s, no borrow on units
// 8: 3 digit, no negative answers, only with borrow on 10s, only with borrow on units
// 9: 1 digit, only negative answers
// Levels 10 to 16, same as levels 2 - 8 except only negative answers
// 17: 4 digit, no negative, any borrowing or non borrowing
// 18: 4 digit only negative answers, any borrowing or non borrowing
// 19: 5 digit, positive and negative answers, any borrowing or non borrowing

                {
            id: 'sub2d',
            label: 'Subtraction - 2-Digit with -ve (e.g., 37 - 86)',
            description: 'Assembles random 2-digit subtraction layouts that can result in positive, zero, or negative answers.',
            answerFormat: 'decimal',
            enabled: false,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * 89) + 11;
                const num2 = Math.floor(Math.random() * 89) + 11;
                return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
            }
        },
        {
            id: 'sub3d-pos',
            label: 'Subtraction - 3-Digit +ve only (e.g., 446 - 312)',
            description: 'Presents 3-digit subtraction expressions ranging between 40 and 999, safely structured to guarantee non-negative outcomes.',
            answerFormat: 'decimal',
            enabled: false,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * 960) + 40;
                const num2 = Math.floor(Math.random() * (num1 - 40)) + 40;
                return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
            }
        },
        {
            id: 'sub3d',
            label: 'Subtraction - 3-Digit with -ve (e.g., 317 - 869)',
            description: 'Develops 3-digit signed subtraction layouts where calculations can easily yield negative integers.',
            answerFormat: 'decimal',
            enabled: false,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * 960) + 40;
                const num2 = Math.floor(Math.random() * 960) + 40;
                return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
            }
        },
        {
            id: 'sub4d',
            label: 'Subtraction - 4-Digit with -ve (e.g., 4435 - 6783)',
            description: 'Supplies high-range 4-digit subtraction structures containing unconstrained negative integer outcomes.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * (9999 - 400 + 1)) + 400;
                const num2 = Math.floor(Math.random() * (9999 - 400 + 1)) + 400;
                return { question: `${num1} - ${num2} = `, answer: (num1 - num2).toString() };
            }
        },
        {
            id: 'squaredOps',
            label: 'Squared Operations (4² to 22²)',
            description: 'Generates arithmetic evaluations combining exponential powers of two with dynamic mathematical operations.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * (22 - 4 + 1)) + 4;
                const num2 = Math.floor(Math.random() * (22 - 4 + 1)) + 4;
                const operations = ['+', '-', '×'];
                const selectedOp = operations[Math.floor(Math.random() * operations.length)];
                
                let ansValue = 0;
                const v1 = num1 * num1;
                const v2 = num2 * num2;
                if (selectedOp === '+') ansValue = v1 + v2;
                else if (selectedOp === '-') ansValue = v1 - v2;
                else ansValue = v1 * v2;

                return { question: `${num1}² ${selectedOp} ${num2}² = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'multTable',
            label: 'Multiplication - Tables (up to 12 x 12)',
            description: 'Generates standard primary curriculum multiplication core table arrays scaling up to 12.',
            answerFormat: 'decimal',
            enabled: false,
            defaultChecked: true,
            generate: () => {
                const num1 = Math.floor(Math.random() * 11) + 2;
                const num2 = Math.floor(Math.random() * 11) + 2;
                return { question: `${num1} × ${num2} = `, answer: (num1 * num2).toString() };
            }
        },
        {
            id: 'multSimpleMixed',
            label: 'Multiplication - Factors 3-12 by 13-20',
            description: 'Multiplies a single/double-digit number (3 to 12) by a larger double-digit number (13 to 20).',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                //const num1 = Math.floor(Math.random() * (12 - 3 + 1)) + 3;
                const allowed = [3, 4, 5, 6, 7, 8, 9, 11, 12];
                const num1 = allowed[Math.floor(Math.random() * allowed.length)];
                
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
//
//                let num1 = rand(3, 12);
//                while (num1 === 10) {
//                    num1 = rand(3, 12);
//                }
                
                const num2 = Math.floor(Math.random() * (19 - 13 + 1)) + 13;
                return { question: `${num1} × ${num2} = `, answer: (num1 * num2).toString() };
            }
        },
        {
            id: 'multMixed',
            label: 'Multiplication - (2-12 × 110-999)',
            description: 'Multiply a single/double-digit number (2 to 12) by a larger three-digit number (110 to 999)',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                //const num1 = Math.floor(Math.random() * (12 - 2 + 1)) + 2;
                const allowed = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];
                const num1 = allowed[Math.floor(Math.random() * allowed.length)];
                const num2 = Math.floor(Math.random() * (999 - 110 + 1)) + 110;
                return { question: `${num1} × ${num2} = `, answer: (num1 * num2).toString() };
            }
        },
        {
            id: 'decMult',
            label: 'Multiplication - Decimal (1.1-99.9 × 2-20)',
            description: 'Decimal place movement operations involving decimal products against standard whole number multipliers.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                let decNum = 1.0;
                while (decNum === 1.0) {
                    decNum = (Math.floor(Math.random() * (999 - 1 + 1)) + 1) / 10;
                }
                const wholeNum = Math.floor(Math.random() * (20 - 2 + 1)) + 2;
                // Use precise floating-point multiplier fixes
                const ansValue = parseFloat((decNum * wholeNum).toFixed(2));
                return { question: `${decNum} × ${wholeNum} = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'powerOfTenMult',
            label: 'Multiplication - Powers of 10',
            description: 'Multiplies decimal factors by positive powers of 10, utilizing fixed-point scaling to eliminate floating-point string bugs.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
                const base = (Math.floor(Math.random() * 9999) + 1) / 10000;
                const exp1 = Math.floor(Math.random() * 4) + 1;
                const exp2 = Math.floor(Math.random() * 4) + 1;
                
                const num1 = +(base * Math.pow(10, exp1)).toFixed(4);
                const num2 = Math.pow(10, exp2);
                const ansValue = parseFloat((num1 * num2).toFixed(4));
                
                return { question: `${num1} × ${num2} = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'negPowerOfTenMult',
            label: 'Multiplication - Negative Powers of 10',
            description: 'Multiplies a decimal by negative powers of 10, forcing decimal point shifts to the left with precision rounding.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
                const base = (Math.floor(Math.random() * 9999) + 1) / 10000;
                const exp1 = Math.floor(Math.random() * 4) + 1;
                const exp2 = Math.floor(Math.random() * 4) + 1;
                
                const num1 = +(base * Math.pow(10, exp1)).toFixed(4);
                const num2 = +(1 / Math.pow(10, exp2)).toFixed(exp2);
                const ansValue = parseFloat((num1 * num2).toFixed(8));
                
                return { question: `${num1} × ${num2} = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'scaledPowerOfTenMult',
            label: 'Multiplication - Scaled Decimal Power of 10',
            description: 'Multiplies a dynamic power of 10 decimal by a single digit integer scaled down by a negative power of 10.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const base1 = (Math.floor(Math.random() * (999 - 1 + 1)) + 1) / 1000;
                const exp1 = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
                const num1 = +(base1 * Math.pow(10, exp1)).toFixed(4);

                const exp2 = Math.floor(Math.random() * (-1 - (-4) + 1)) + (-4);
                const multiplier = Math.floor(Math.random() * (9 - 2 + 1)) + 2;
                const num2 = +(multiplier * Math.pow(10, exp2)).toFixed(4);
                const ansValue = parseFloat((num1 * num2).toFixed(8));

                return { question: `${num1} × ${num2} = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'largePowerOfTenMult',
            label: 'Multiplication - Large Power of 10 Factors',
            description: 'Multiplies a dynamic power of 10 decimal by a single-digit integer scaled up by a positive power of 10.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const base1 = (Math.floor(Math.random() * (9999 - 1 + 1)) + 1) / 10000;
                const exp1 = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
                const num1 = +(base1 * Math.pow(10, exp1)).toFixed(4);

                const multiplier = Math.floor(Math.random() * (9 - 2 + 1)) + 2;
                const exp2 = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
                const num2 = multiplier * Math.pow(10, exp2);
                const ansValue = parseFloat((num1 * num2).toFixed(4));

                return { question: `${num1} × ${num2} = `, answer: ansValue.toString() };
            }
        },
                {
            id: 'roundedPowerOfTenMult',
            label: 'Multiplication - By 15 or 25',
            description: 'Multiplies a rounded-up power of 10 scaled factor against either 15 or 25.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const base = (Math.floor(Math.random() * (999 - 10 + 1)) + 10) / 1000;
                const exponent = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
                const num1 = Math.ceil(base * Math.pow(10, exponent));
                const num2 = Math.random() < 0.5 ? 15 : 25;
                
                return { question: `${num1} × ${num2} = `, answer: (num1 * num2).toString() };
            }
        },
        {
            id: 'percentageOfLargeNum',
            label: 'Multiplication - Percentage or Decimal of Large Numbers',
            description: 'Calculates a multiple of 5 percentage against a large multiple of 100, randomly formatted as a percentage (%) or a decimal.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const percent = Math.floor(Math.random() * (19 - 1 + 1) + 1) * 5;
                const value = Math.floor(Math.random() * (99 - 10 + 1) + 10) * 100;
                const ansValue = (percent / 100) * value;
                
                if (Math.random() < 0.5) {
                    return { question: `${percent}% × ${value} = `, answer: ansValue.toString() };
                } else {
                    const decimalFormat = +(percent / 100).toFixed(2);
                    return { question: `${decimalFormat} × ${value} = `, answer: ansValue.toString() };
                }
            }
        },
        {
            id: 'decimalMultiplesMult',
            label: 'Multiplication - Decimal Multiples of 0.05',
            description: 'Multiplies two decimals that are both multiples of 0.05 (ranging from 0.05 to 0.95).',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const num1 = +(Math.floor(Math.random() * (19 - 1 + 1) + 1) * 5 / 100).toFixed(2);
                const num2 = +(Math.floor(Math.random() * (19 - 1 + 1) + 1) * 5 / 100).toFixed(2);
                const ansValue = parseFloat((num1 * num2).toFixed(4));
                
                return { question: `${num1} × ${num2} = `, answer: ansValue.toString() };
            }
        },
        {
            id: 'scientificLargeMult',
            label: 'Multiplication - Large Powers of 10 Products',
            description: 'Multiplies two large numbers that are multiples of powers of 10 (ranging from tens to millions).',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
                const digit1 = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
                const exp1 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
                const num1 = digit1 * Math.pow(10, exp1);

                const digit2 = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
                const exp2 = Math.floor(Math.random() * (6 - 1 + 1)) + 1;
                const num2 = digit2 * Math.pow(10, exp2);
                
                return { question: `${num1} × ${num2} = `, answer: (num1 * num2).toString() };
            }
        },
        {
            id: 'divMixed',
            label: 'Division (110-999 ÷ 2-12)',
            description: 'Generates division expressions. Requires students to write answers as clean mixed fractions or exact integers.',
            answerFormat: 'mixedFraction', // Enforces mixed fraction presentation
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const numSmall = Math.floor(Math.random() * (12 - 2 + 1)) + 2;
                const numBig = Math.floor(Math.random() * (999 - 110 + 1)) + 110;
                
                // Store the precise decimal value as the answer source so normalizers compute remainders perfectly
                const actualExactValue = numBig / numSmall;

                return { 
                    question: `${numBig} ÷ ${numSmall} = `, 
                    answer: actualExactValue.toFixed(10) // Preserves the exact remainder digits!
                };
            }
        },
        {
            id: 'divMixed2',
            label: 'Division (110-999 ÷ 13-25)',
            description: 'Generates division expressions. Requires students to write answers as clean mixed fractions or exact integers.',
            answerFormat: 'mixedFraction', // Enforces mixed fraction presentation
            enabled: true,
            defaultChecked: true,
            generate: () => {
                const numSmall = Math.floor(Math.random() * (25 - 13 + 1)) + 13;
                const numBig = Math.floor(Math.random() * (999 - 110 + 1)) + 110;
                
                // Store the precise decimal value as the answer source so normalizers compute remainders perfectly
                const actualExactValue = numBig / numSmall;

                return { 
                    question: `${numBig} ÷ ${numSmall} = `, 
                    answer: actualExactValue.toFixed(10) // Preserves the exact remainder digits!
                };
            }
        },

        {
            id: 'fractionMultiply',
            label: 'Fractions - Multiplication',
            description: 'Generates fraction equations using HTML fraction formatting rules, with denominators safely guarded against zero.',
            answerFormat: 'mixedFraction',
            enabled: true,
            defaultChecked: false,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

                let num1 = rand(1, 11); 
                let den1 = rand(2, 12);
                while (num1 === den1) {
                    den1 = rand(2, 12);
                }

                let num2 = rand(1, 11); 
                let den2 = rand(2, 12);
                while (num2 === den2 || den1 === den2) {
                    den2 = rand(2, 12);
                }
                //const operations = ['+', '-', '×'];
                //const selectedOp = operations[Math.floor(Math.random() * operations.length)];
                
                // Track answers using fractional string formats for clarity
                let ansStr = "";
                //if (selectedOp === '×') {
                    ansStr = `${num1 * num2}/${den1 * den2}`;
//                } else if (selectedOp === '+') {
//                    ansStr = `${(num1 * den2) + (num2 * den1)}/${den1 * den2}`;
//                } else {
//                    ansStr = `${(num1 * den2) - (num2 * den1)}/${den1 * den2}`;
//                }
                
                return { 
                    question: `<sup>${num1}</sup>&frasl;<sub>${den1}</sub> X <sup>${num2}</sup>&frasl;<sub>${den2}</sub> = `, 
                    answer: ansStr 
                };
            }
        },
        {
            id: 'fractionAddition',
            label: 'Fractions - Addition',
            description: 'Generates fraction equations using HTML fraction formatting rules, with denominators safely guarded against zero.',
            answerFormat: 'mixedFraction',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

                let num1 = rand(1, 11); 
                let den1 = rand(2, 12);
                while (num1 === den1) {
                    den1 = rand(2, 12);
                }

                let num2 = rand(1, 11); 
                let den2 = rand(2, 12);
                while (num2 === den2 || den1 === den2) {
                    den2 = rand(2, 12);
                }
                //const operations = ['+', '-', '×'];
                //const selectedOp = operations[Math.floor(Math.random() * operations.length)];
                
                // Track answers using fractional string formats for clarity
                let ansStr = "";
//                if (selectedOp === '×') {
//                    ansStr = `${num1 * num2}/${den1 * den2}`;
//                } else if (selectedOp === '+') {
                    ansStr = `${(num1 * den2) + (num2 * den1)}/${den1 * den2}`;
//                } else {
//                    ansStr = `${(num1 * den2) - (num2 * den1)}/${den1 * den2}`;
//                }
                
                return { 
                    question: `<sup>${num1}</sup>&frasl;<sub>${den1}</sub> + <sup>${num2}</sup>&frasl;<sub>${den2}</sub> = `, 
                    answer: ansStr 
                };
            }
        },
        {
            id: 'fractionSubtraction',
            label: 'Fractions - Subtraction',
            description: 'Generates fraction equations using HTML fraction formatting rules, with denominators safely guarded against zero.',
            answerFormat: 'mixedFraction',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

                let num1 = rand(1, 11); 
                let den1 = rand(2, 12);
                while (num1 === den1) {
                    den1 = rand(2, 12);
                }

                let num2 = rand(1, 11); 
                let den2 = rand(2, 12);
                while (num2 === den2 || den1 === den2) {
                    den2 = rand(2, 12);
                }
//                const operations = ['+', '-', '×'];
//                const selectedOp = operations[Math.floor(Math.random() * operations.length)];
                
                // Track answers using fractional string formats for clarity
                let ansStr = "";
//                if (selectedOp === '×') {
//                    ansStr = `${num1 * num2}/${den1 * den2}`;
//                } else if (selectedOp === '+') {
//                    ansStr = `${(num1 * den2) + (num2 * den1)}/${den1 * den2}`;
//                } else {
                    ansStr = `${(num1 * den2) - (num2 * den1)}/${den1 * den2}`;
//                }
                
                return { 
                    question: `<sup>${num1}</sup>&frasl;<sub>${den1}</sub> - <sup>${num2}</sup>&frasl;<sub>${den2}</sub> = `, 
                    answer: ansStr 
                };
            }
        },
                    {
            id: 'algebraParentheses',
            label: 'Algebra - Linear Equations with Parentheses',
            description: 'Generates valid linear equations with parentheses on both sides, dynamically checked to prevent illegal parallel lines or division-by-zero errors.',
            answerFormat: 'mixedFraction',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const sign = () => Math.random() < 0.5 ? '+' : '-';
                
                while (true) {
                    const n1 = rand(2, 12); const n2 = rand(2, 12);
                    const n3 = rand(2, 12); const n4 = rand(2, 12);
                    const s1 = sign(); const s3 = sign();
                    const s4 = sign(); const s6 = sign();

                    const leftInternalCoeff = rand(1, 3);
                    const rightInternalCoeff = rand(1, 3);

                    const leftMult = s1 === '-' ? -n1 : n1;
                    const leftConst = s3 === '-' ? -n2 : n2;
                    const rightMult = s4 === '-' ? -n3 : n3;
                    const rightConst = s6 === '-' ? -n4 : n4;

                    const leftCoeffA = leftMult * leftInternalCoeff;
                    const leftValueC = leftMult * leftConst;
                    
                    const rightCoeffA = rightMult * rightInternalCoeff;
                    const rightValueC = rightMult * rightConst;

                    const finalCoeffA = leftCoeffA - rightCoeffA;
                    const finalValueC = rightValueC - leftValueC;

                    if (finalCoeffA === 0) continue; 

                    const valA = finalValueC / finalCoeffA;

                    const lMultStr = s1 === '-' ? `-${n1}` : `${n1}`;
                    const lConstStr = s3 === '-' ? `- ${n2}` : `+ ${n2}`;
                    const rMultStr = s4 === '-' ? `-${n3}` : `${n3}`;
                    const rConstStr = s6 === '-' ? `- ${n4}` : `+ ${n4}`;

                    const leftVarStr = leftInternalCoeff === 1 ? 'A' : `${leftInternalCoeff}A`;
                    const rightVarStr = rightInternalCoeff === 1 ? 'A' : `${rightInternalCoeff}A`;

                    // FORMAT FIX: Appended standard prompt parameters suffix cleanly to layout line
                    return {
                        question: `${lMultStr}(${leftVarStr} ${lConstStr}) = ${rMultStr}(${rightVarStr} ${rConstStr}), &nbsp;&nbsp; A = `,
                        answer: parseFloat(valA.toFixed(10)).toString()
                    };
                }
            }
        },


                {
            id: 'algebraSolveAndSubstitute',
            label: 'Algebra - Solve and Substitute Combo',
            description: 'Generates a validated linear parenthetical equation to find variable A, then dynamically evaluates it against a secondary expression.',
            answerFormat: 'mixedFraction',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const sign = () => Math.random() < 0.5 ? '+' : '-';
                const randNonZero = (min, max) => { let num = 0; while (num === 0) num = rand(min, max); return num; };

                while (true) {
                    const n1 = rand(2, 8); const n2 = rand(2, 8);
                    const n3 = rand(2, 8); const n4 = rand(2, 8);
                    const s1 = sign(); const s3 = sign();
                    const s4 = sign(); const s6 = sign();

                    // NEW PASS: Randomize structural coefficients of A from 1 to 3 inside brackets
                    const leftInternalCoeff = rand(1, 3);
                    const rightInternalCoeff = rand(1, 3);

                    const leftMult = s1 === '-' ? -n1 : n1;
                    const leftConst = s3 === '-' ? -n2 : n2;
                    const rightMult = s4 === '-' ? -n3 : n3;
                    const rightConst = s6 === '-' ? -n4 : n4;

                    const leftCoeffA = leftMult * leftInternalCoeff;
                    const rightCoeffA = rightMult * rightInternalCoeff;

                    const finalCoeffA = leftCoeffA - rightCoeffA;
                    const finalValueC = (rightMult * rightConst) - (leftMult * leftConst);

                    if (finalCoeffA === 0) continue; 

                    const valA = finalValueC / finalCoeffA;

                    // Validate integer solution targets for mental math simplicity during substitution steps
                    if (valA % 1 === 0) {
                        const coeffSub = randNonZero(-8, 8);
                        const constSub = randNonZero(-25, 25);
                        const dynamicFinalAnswer = (coeffSub * valA) + constSub;

                        const lMultStr = s1 === '-' ? `-${n1}` : `${n1}`;
                        const lConstStr = s3 === '-' ? `- ${n2}` : `+ ${n2}`;
                        const rMultStr = s4 === '-' ? `-${n3}` : `${n3}`;
                        const rConstStr = s6 === '-' ? `- ${n4}` : `+ ${n4}`;

                        const leftVarStr = leftInternalCoeff === 1 ? 'A' : `${leftInternalCoeff}A`;
                        const rightVarStr = rightInternalCoeff === 1 ? 'A' : `${rightInternalCoeff}A`;

                        const equationStr = `${lMultStr}(${leftVarStr} ${lConstStr}) = ${rMultStr}(${rightVarStr} ${rConstStr})`;
                        
                        let coeffSubStr = coeffSub === 1 ? '' : (coeffSub === -1 ? '-' : coeffSub);
                        const opSubStr = constSub < 0 ? '-' : '+';
                        const absConstSub = Math.abs(constSub);
                        const substitutionStr = `${coeffSubStr}A ${opSubStr} ${absConstSub} = `;

                        return {
                            question: `<div>1. Solve: ${equationStr}</div><div style="margin-top: 5px; font-size: 0.9em; color: #555;">2. Then evaluate: ${substitutionStr}</div>`,
                            answer: dynamicFinalAnswer.toString()
                        };
                    }
                }
            }
        },


                {
            id: 'algebraSubstitution',
            label: 'Algebra - Single Variable Substitution',
            description: 'Generates a linear expression where students substitute a given value for variable A to solve.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const coeff = rand(1, 12); const constant = rand(6, 49); const valA = rand(2, 12);
                const ansValue = (coeff * valA) + constant;
                
                // ORDER SWAP FIX: Declare variable first so the layout's trailing blank aligns to the equals sign
                let coeffStr = coeff === 1 ? '' : coeff;
                return { 
                    question: `If A = ${valA}, evaluate: ${coeffStr}A + ${constant} =`, 
                    answer: ansValue.toString() 
                };
            }
        },
        {
            id: 'algebraSubstitutionNeg',
            label: 'Algebra - Single Variable Substitution (with Negatives)',
            description: 'Generates a linear expression where the coefficient, constant, and variable A can all be positive or negative.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const randNonZero = (min, max) => { let num = 0; while (num === 0) num = rand(min, max); return num; };

                const coeff = randNonZero(-19, 19); 
                const constant = randNonZero(-249, 249); 
                const valA = randNonZero(-19, 19);
                const ansValue = (coeff * valA) + constant;
                
                let coeffStr = coeff === 1 ? '' : (coeff === -1 ? '-' : coeff);
                const opStr = constant < 0 ? '-' : '+';
                const absConstant = Math.abs(constant);
                
                // ORDER SWAP FIX: Clean structural line mapping with proper negative formatting and no trailing brackets
                return { 
                    question: `If A = ${valA}, evaluate: ${coeffStr}A ${opStr} ${absConstant} =`, 
                    answer: ansValue.toString() 
                };
            }
        },


                
        {
            id: 'algebraRearrangement',
            label: 'Algebra - Basic Rearrangement',
            description: 'Generates one-step equations in three styles (multiplication, division with unknown numerator, or division with unknown denominator).',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const factor1 = rand(3, 16); const factor2 = rand(3, 16); const product = factor1 * factor2;

                const styles = [
                    { q: `A / ${factor1} = ${factor2}`, a: product },
                    { q: `${product} / A = ${factor2}`, a: factor1 },
                    { q: `${factor1}A = ${product}`, a: factor2 }
                ];
                const chosen = styles[Math.floor(Math.random() * styles.length)];
                return { question: `${chosen.q}, &nbsp;&nbsp; A = `, answer: chosen.a.toString() };
            }
        },

                {
            id: 'algebraRearrangementNeg',
            label: 'Algebra - Basic Rearrangement (with Negatives)',
            description: 'Generates signed one-step equations in three styles, formatted natively without brackets.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const randNonZero = (min, max) => { let num = 0; while (num === 0) num = rand(min, max); return num; };

                const factor1 = randNonZero(-16, 16); 
                const factor2 = randNonZero(-16, 16); 
                const product = factor1 * factor2;

                let style3Coeff = factor1 === 1 ? '' : (factor1 === -1 ? '-' : factor1);

                const styles = [
                    { q: `A / ${factor1} = ${factor2}`, a: product },
                    { q: `${product} / A = ${factor2}`, a: factor1 },
                    { q: `${style3Coeff}A = ${product}`, a: factor2 }
                ];
                const chosen = styles[Math.floor(Math.random() * styles.length)];
                return { 
                    question: `${chosen.q}, &nbsp;&nbsp; A = `, 
                    answer: chosen.a.toString() 
                };
            }
        },

        {
            id: 'powerOfTenDivision',
            label: 'Division - Large Powers of 10',
            description: 'Divides numbers expressed as powers of 10, challenging students to subtract exponents.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const exp1 = rand(5, 15); const exp2 = rand(2, 9);
                return { question: `10<sup>${exp1}</sup> &divide; 10<sup>${exp2}</sup> = `, answer: `10^${exp1 - exp2}` };
            }
        },
        {
            id: 'powerOfTwoDivision',
            label: 'Division - Large Powers of 2',
            description: 'Divides numbers expressed as powers of 2. The first exponent is strictly larger, with a maximum index gap of 15.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const exp1 = rand(7, 23);
                const minExp2 = Math.max(2, exp1 - 15); const maxExp2 = exp1 - 1;
                const exp2 = rand(minExp2, maxExp2);
                
                return { question: `2<sup>${exp1}</sup> &divide; 2<sup>${exp2}</sup> = `, answer: `2^${exp1 - exp2}` };
            }
        },
                {
            id: 'negativeIntegerOps',
            label: 'Arithmetic - Directed Negative Integers',
            description: 'Generates neat addition and subtraction equations using a mixture of positive and negative structures without double-sign issues.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                
                // Roll the first term normally (can be positive or negative)
                const num1 = rand(-30, 30);
                // Roll the second term strictly as a positive absolute spacing factor
                const absoluteNum2 = rand(1, 30);
                
                // The operator string acts as the sole decision vector for the math
                const op = Math.random() < 0.5 ? '+' : '-';
                
                let ansValue = op === '+' ? num1 + absoluteNum2 : num1 - absoluteNum2;
                
                // Returns clean text lines like "-15 - 12 =" or "14 + 3 =" with zero parentheses
                return { 
                    question: `${num1} ${op} ${absoluteNum2} = `, 
                    answer: ansValue.toString() 
                };
            }
        },

        {
            // Rewrite this, maybe first select the answer, then work backwards from there. Too many questions have no decent answer
            id: 'lcmHcfChallenges',
            label: 'Fractions - LCM or HCF Identification',
            description: 'Alternates between asking for the Lowest Common Multiple (LCM) or Highest Common Factor (HCF) of two numbers.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const num1 = rand(4, 12); const num2 = rand(4, 16);
                
                const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                const lcm = (a, b) => (a * b) / gcd(a, b);
                
                if (Math.random() < 0.5) {
                    return { question: `Find the LCM of ${num1} and ${num2} = `, answer: lcm(num1, num2).toString() };
                } else {
                    return { question: `Find the HCF of ${num1} and ${num2} = `, answer: gcd(num1, num2).toString() };
                }
            }
        },
                {
            id: 'missingNum',
            label: 'Missing Number Algebra (e.g., 7 + __ = 15)',
            description: 'Generates missing term linear algebra problems targeting single-digit or double-digit integer solutions.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: false,
            generate: () => {
                const num1 = Math.floor(Math.random() * 599) + 2; 
                const answer = Math.floor(Math.random() * 994) + 5;
                // FORMAT FIX: Appended standard assignment string format
                return { question: `${num1} + A = ${num1 + answer}, &nbsp;&nbsp; A = `, answer: answer.toString() };
            }
        },

        {
            id: 'missingNumNeg',
            label: 'Missing Number Algebra (with Negatives)',
            description: 'Generates addition/subtraction equations where any of the terms or the answer can be negative numbers, cleanly formatted.',
            answerFormat: 'decimal',
            enabled: true,
            defaultChecked: true,
            generate: () => {
//                const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
                const randNonZero = (min, max) => { let num = 0; while (num === 0) num = rand(min, max); return num; };

                const num1 = randNonZero(-599, 599); 
                const answer = randNonZero(-994, 994);
                const num2 = num1 + answer;

                // FORMAT FIX: Appended standard assignment string format
                return { 
                    question: `${num1} + A = ${num2}, &nbsp;&nbsp; A = `, 
                    answer: answer.toString() 
                };
            }
        }

    ];