import { signal, computed, effect } from '@maverick-js/signals';

// ELEMENTS
// get input element
let inputElement = document.querySelector('#inputElement')
// get output element
let outputElement = document.querySelector('#outputElement')
// get the currency selection dropdown
let currencyElement = document.querySelector('#currencyElement')
// rates updated element
let ratesUpdatedElement = document.querySelector('#ratesDate')
// refetch button
let refetchButton = document.querySelector('#refetchButton')

// REACTIVE PROPERTIES
// loading
let loading = signal(false)
// the selected currency to convert from
let selectedCurrency = signal('jpy')
// set the initial input value
let inputValue = signal(2000)
// set the initial currencies list
let currencies = signal([])
// set the initial conversions ratios
let conversionRates = signal([])
// the date the conversionRates got updated last
let conversionRatesDate = signal(null)

// SETUP
requestAnimationFrame(() => {
    inputElement.value  = inputValue()
})

// update the conversion rates date text when it gets fetched 
effect(() => {
    ratesUpdatedElement.innerHTML = conversionRatesDate()
})

effect(() => {
    if (loading()) {
        document.body.classList.add('loading')
    } else {
        document.body.classList.remove('loading')
    }
})

function setSelectedCurrency() {
    selectedCurrency.set(currencyElement.value)
}

currencyElement.addEventListener('change', () => {
    setSelectedCurrency()
})

let output = computed(() => {
    if (!inputValue()) { return 'No input set' }
    if (!conversionRates()?.length) { return 'No conversion rates' }
    if (!selectedCurrency()) { return 'No selected currency' }
    const conversionRate = conversionRates().find(conversion => conversion.currency === selectedCurrency()).value
    const value = inputValue() / conversionRate
    return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value)
})

effect(() => {
    outputElement.innerHTML = output()
    return () => {}
})

inputElement.addEventListener('input', () => {
    inputValue.set(+inputElement.value)
})

inputElement.focus()

async function fetchCurrencies() {
    loading.set(true)

    const storageCurrenciesDate = localStorage.getItem('currencies-date')
    const currentDate = new Date().toISOString().slice(0, 10)
    const storageCurrencies = localStorage.getItem('currencies')

    if (storageCurrencies === null || storageCurrenciesDate === null || storageCurrenciesDate < currentDate) {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json')
        const json = await response.json()

        const currencyList = Object.entries(json).map(([key, value]) => ({ value: key, label: value }))
        currencies.set(currencyList)
        localStorage.setItem('currencies', JSON.stringify(currencyList))
        localStorage.setItem('currencies-date', currentDate)
    } else {
        currencies.set(JSON.parse(storageCurrencies))
    }
    
    currencyElement.innerHTML = ''
    currencies().forEach(option => {
        const currencyOption = document.createElement('option')
        currencyOption.value = option.value
        currencyOption.label = option.label
        currencyElement.appendChild(currencyOption)
    })
    
    currencyElement.value = selectedCurrency()
    
    loading.set(false)
}

async function fetchConversionForEuro(force = false) {
    loading.set(true)

    const storageConversionsDate = localStorage.getItem('conversions-date')
    const currentDate = new Date().toISOString().slice(0, 10)
    const storageConversions = localStorage.getItem('conversions')

    if (force || storageConversionsDate === null || storageConversions === null || storageConversionsDate < currentDate) {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json')
        const json = await response.json()

        conversionRatesDate.set(currentDate)
        localStorage.setItem('conversions-date', currentDate)
    
        const conversions = Object.entries(json.eur).map(([currency, value]) => ({ currency, value }))
        conversionRates.set(conversions)
        localStorage.setItem('conversions', JSON.stringify(conversions))
    } else {
        conversionRatesDate.set(currentDate)
        conversionRates.set(JSON.parse(storageConversions))
    }
    
    loading.set(false)
}

fetchConversionForEuro()
fetchCurrencies()

refetchButton.addEventListener('click', () => {
    fetchConversionForEuro(true)
})