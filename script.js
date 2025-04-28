// Color palette for functions
const colorPalette = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63'  // Pink
];

let nextColorIndex = 0;
let plotChart;
let functions = [];

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Initialize the chart
    initChart();

    // Add function button click event
    document.getElementById('add-function').addEventListener('click', addFunction);

    // Calculate button click event
    document.getElementById('calculate').addEventListener('click', calculate);

    // Add initial function
    addFunction();
});

// Initialize the chart
function initChart() {
    const ctx = document.getElementById('plot').getContext('2d');
    
    plotChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: '#ddd'
                    },
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    grid: {
                        color: '#ddd'
                    },
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                        }
                    }
                }
            }
        }
    });
}

// Function to add a new function to the plot
function addFunction() {
    const expressionInput = document.getElementById('expression');
    const expressionValue = expressionInput.value.trim();
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    
    // Simple validation
    if (!expressionValue) {
        showError('Please enter a function expression');
        return;
    }
    
    if (xMin >= xMax) {
        showError('X Min must be less than X Max');
        return;
    }
    
    // Attempt to parse the expression
    try {
        const compiledExpression = math.compile(expressionValue);
        // Test with a simple value
        compiledExpression.evaluate({ x: 1 });
        
        clearError();
        
        const color = colorPalette[nextColorIndex % colorPalette.length];
        nextColorIndex++;
        
        // Add function to the list
        functions.push({
            expression: expressionValue,
            compiled: compiledExpression,
            color: color
        });
        
        // Update the plot
        updatePlot();
        
        // Add to the visual function list
        addFunctionToList(expressionValue, color);
        
        // Clear the input
        expressionInput.value = '';
    } catch (error) {
        showError('Invalid expression: ' + error.message);
    }
}

// Function to update the plot with all functions
function updatePlot() {
    // Clear existing datasets
    plotChart.data.datasets = [];
    
    const xMin = parseFloat(document.getElementById('xMin').value);
    const xMax = parseFloat(document.getElementById('xMax').value);
    
    // Number of points to plot (more points = smoother curve)
    const numPoints = 500;
    const step = (xMax - xMin) / numPoints;
    
    // For each function
    functions.forEach((func, index) => {
        const points = [];
        
        for (let x = xMin; x <= xMax; x += step) {
            try {
                const y = func.compiled.evaluate({ x: x });
                
                // Check if y is a valid number
                if (!isNaN(y) && isFinite(y)) {
                    points.push({ x, y });
                }
            } catch (e) {
                // Skip this point if there's an error
            }
        }
        
        // Add the dataset to the chart
        plotChart.data.datasets.push({
            label: `f(x) = ${func.expression}`,
            data: points,
            borderColor: func.color,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
        });
    });
    
    // Update the chart
    plotChart.update();
}

// Function to add a function to the visual list
function addFunctionToList(expression, color) {
    const functionList = document.getElementById('function-list');
    const index = functions.length - 1;
    
    const functionItem = document.createElement('div');
    functionItem.className = 'function-item';
    functionItem.setAttribute('data-index', index);
    
    const colorIndicator = document.createElement('div');
    colorIndicator.className = 'function-color';
    colorIndicator.style.backgroundColor = color;
    
    const expressionText = document.createElement('div');
    expressionText.className = 'function-expression';
    expressionText.textContent = `f(x) = ${expression}`;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'function-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        // Remove function from the array
        functions.splice(index, 1);
        // Update the plot
        updatePlot();
        // Remove from the list
        functionList.removeChild(functionItem);
        // Update data-index attributes for remaining items
        const items = functionList.querySelectorAll('.function-item');
        items.forEach((item, i) => {
            item.setAttribute('data-index', i);
        });
    });
    
    functionItem.appendChild(colorIndicator);
    functionItem.appendChild(expressionText);
    functionItem.appendChild(removeButton);
    
    functionList.appendChild(functionItem);
}

// Calculator function
function calculate() {
    const expression = document.getElementById('calc-expression').value.trim();
    const resultInput = document.getElementById('result');
    
    if (!expression) {
        resultInput.value = 'Please enter an expression';
        return;
    }
    
    try {
        const result = math.evaluate(expression);
        resultInput.value = result.toString();
    } catch (error) {
        resultInput.value = 'Error: ' + error.message;
    }
}

// Function to show error messages
function showError(message) {
    const errorElement = document.getElementById('expression-error');
    errorElement.textContent = message;
}

// Function to clear error messages
function clearError() {
    const errorElement = document.getElementById('expression-error');
    errorElement.textContent = '';
}
