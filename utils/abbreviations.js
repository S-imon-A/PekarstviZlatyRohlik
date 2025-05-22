export function AbbreviateNumber(number, symbol) {
    let converted_number = ""

    let front_symbol = ""

    number = Math.round(number)
    number = number.toString()
    if (number.slice(0, 1) == "-") {
        front_symbol = "-"
        number = number.slice(1, number.length)
    }

    let digits = number.length

    let t = 1
    for (let i = 0; i < digits; i++) {
        let letter = number.slice(digits - i - 1, digits - i)
        converted_number = converted_number + letter

        if (t == 3 && i != digits - 1) {
            t = 0
            converted_number = converted_number + symbol
        }
        t += 1
    }

    let finished_number = ""
    let converted_number_length = converted_number.length

    for (let i = 0; i < converted_number_length; i++) {
        let letter = converted_number.slice(converted_number_length - i - 1, converted_number_length - i)
        finished_number = finished_number + letter
    }

    finished_number = front_symbol + finished_number

    return finished_number
}
