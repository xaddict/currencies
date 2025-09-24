import { signal, computed, effect } from '@maverick-js/signals';

// get input element
let inputElement = document.querySelector('#inputElement')
// get output element
let outputElement = document.querySelector('#outputElement')
// get yen ratio element
let yenElement = document.querySelector('#yenElement')
// get euro ratio element
let euroElement = document.querySelector('#euroElement')

// set the initial input value
let inputValue = signal(2000)
// set the value to the element
inputElement.value  = inputValue()

let conversionYen = signal(1000)
yenElement.value = +conversionYen()
let conversionEuro = signal(5.73)
euroElement.value = +conversionEuro()

let output = computed(() => {
    const value = (inputValue() / conversionYen()) * conversionEuro()
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value)
})

effect(() => {
    outputElement.innerHTML = output()

    return () => {}
})

inputElement.addEventListener('input', () => {
    inputValue.set(+inputElement.value)
})

yenElement.addEventListener('input', () => {
    conversionYen.set(+yenElement.value)
})

euroElement.addEventListener('input', () => {
    conversionEuro.set(+euroElement.value)
})


inputElement.focus()