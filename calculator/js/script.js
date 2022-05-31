new Vue({
  el: "#calculator",
  data: {
    displayValue: "0",
    currentOperator: "",
    waitingForOperand: true,
    calculation: ["0"],
    tempCalculation: [],
    canClear: false
  },
  computed: {
    displayValueFormatted: function() {
      var value = this.displayValue.replace(/e\+/, "e") || "0";
      if (value.length > 14) {
        this.displayValue = "Error";
        return "Error";
      }

      var number = value.split(".");
      var integerPart = number[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var floatPart = number[1] || "";
      if (this.waitingForOperand && number.length === 2) {
        return integerPart + "." + floatPart;
      } else {
        return floatPart === "" ? integerPart : integerPart + "." + floatPart;
      }
    }
  },
  methods: {
    inputDigit: function(digit) {
      var length = this.calculation.length;

      this.canClear = true;

      // Input digit normally
      if (this.waitingForOperand) {
        if (this.displayValue === "0") {
          // Check digit is "."
          if (digit === ".") {
            this.displayValue = "0.";
          } else {
            this.displayValue = digit;
          }

          // Add operator and digit to the calculation after clear
          if (this.currentOperator && this.currentOperator !== "=") {
            this.calculation.push(this.currentOperator);
            this.calculation.push(this.displayValue);
          } else {
            this.calculation[length - 1] = this.displayValue;
          }
        } else {
          // Add digit to current number, maximum digits is 9
          if (this.displayValue.length < 9) {
            // Prevent more than one character "."
            if (digit === "." && this.displayValue.indexOf(".") !== -1) return;

            this.displayValue += digit;
            this.calculation[length - 1] = this.displayValue;
          }
        }
      } else {
        // Input digit after input operator
        // Display new number
        this.displayValue = digit;
        this.waitingForOperand = true;

        // Add operator and digit to the calculation
        if (this.currentOperator !== "=") {
          this.calculation.push(this.currentOperator);
          this.calculation.push(digit);
        } else {
          this.calculation = [digit];
        }
      }
    },
    inputOperator: function(operator) {
      var length = this.calculation.length;
      var currentOperator = this.currentOperator;
      var tempCalculation = this.tempCalculation;

      // Display result of the calculation when input "-" or "+"
      if ((operator === "-" || operator === "+") && length > 2) {
        this.displayValue = eval(this.calculation.join("")).toString();
      } else if (operator === "=") {
        // If the operator is "=", allow fast calculate
        // If the calculation only has 1 number, calculate itself with current operator
        if (
          length === 1 &&
          tempCalculation.length === 0 &&
          currentOperator &&
          currentOperator !== "="
        ) {
          this.displayValue = eval(
            this.calculation[0] + currentOperator + this.calculation[0]
          );
          this.tempCalculation = [currentOperator, this.calculation[0]];
        } else if (tempCalculation.length && currentOperator === "=") {
          // If current operator is "=", continue calculate with tempCalculation
          this.displayValue = eval(
            this.displayValue + tempCalculation[0] + tempCalculation[1]
          );
        } else {
          // Normal calculate
          this.displayValue = eval(this.calculation.join(""));

          // Store last calculation to tempCalculation
          if (
            this.calculation[length - 2] !== undefined &&
            this.calculation[length - 2] !== "="
          )
            this.tempCalculation = [
              this.calculation[length - 2],
              this.calculation[length - 1]
            ];
        }

        // Reset the calculation
        this.calculation = [this.displayValue.toString()];
      }

      this.currentOperator = operator;
      this.waitingForOperand = false;
      this.roundResult();
    },
    clear: function() {
      // Reset current number
      this.canClear = false;
      this.displayValue = "0";

      var length = this.calculation.length;
      if (this.waitingForOperand) {
        if (length === 1) {
          this.calculation[0] = "0";
        } else {
          this.calculation.splice(length - 2, 2);
        }
      }
    },
    clearAll: function() {
      // Reset the calculation
      this.displayValue = "0";
      this.currentOperator = "";
      this.waitingForOperand = true;
      this.calculation = ["0"];
      this.tempCalculation = [];
    },
    changeSign: function() {
      if (this.displayValue.indexOf("-") === 0) {
        this.displayValue = this.displayValue.replace("-", "");
      } else {
        this.displayValue = "-" + this.displayValue;
      }

      if (this.waitingForOperand) {
        this.calculation[this.calculation.length - 1] = this.displayValue;
      }
    },
    calculatePercent: function() {
      this.displayValue = (+this.displayValue / 100).toString();
      this.roundResult();

      if (this.waitingForOperand) {
        this.calculation[this.calculation.length - 1] = this.displayValue;
      }
    },
    roundResult: function() {
      // Round to 9 digits
      this.displayValue = (+(+this.displayValue).toFixed(8)).toPrecision(9);

      // Remove insignificant trailing zeros of float number
      var value = this.displayValue;
      if (value[value.length - 1] === "0")
        this.displayValue = parseFloat(value).toString();

      // Display "Error" instead of "Infinity"
      if (value === "Infinity" || value === "NaN") this.displayValue = "Error";
    }
  }
});