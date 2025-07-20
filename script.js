function format(number) {
  const suffixes = ["", "k", "M", "G", "T"];
  let index = Math.floor(Math.floor(Math.log10(number)) / 3);

  if (number >= 1000) {
    return (
      number /
      Math.pow(10, 3 * index) +
      " " +
      suffixes[index] +
      "Ω"
    );
  } else {
    return number + " Ω";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const dark_colours = ["Black", "Brown", "Red", "Green", "Blue", "Grey"];

  let digits = new Array(3),
    multiplier,
    tolerance,
    tcr,
    bands = 4;

  document.getElementById("bands").addEventListener("change", function () {
    let values = new Array(6);

    bands = document.getElementById("bands").value;

    switch (bands) {
      case "6":
        values = ["unset", "unset", "unset", "inline-block", "inline-block", "inline-block"]
        break;
      case "5":
        values = ["unset", "none", "unset", "inline-block", "inline-block", "none"]
        break;
      case "4":
        values = ["none", "none", "unset", "none", "inline-block", "none"]
        break;
      default:
        values = ["none", "none", "none", "none", "none", "none"]
        tolerance = 0.2;
    }

    document.getElementById("third_band").style.display = values[0];
    document.getElementById("tcr_band").style.display = values[1];
    document.getElementById("tolerance_band").style.display = values[2];
    document.getElementById("band_2").style.display = values[3];
    document.getElementById("band_4").style.display = values[4];
    document.getElementById("band_5").style.display = values[5];
  });

  [0, 1, 2].forEach(function (n) {
    document
      .getElementById("digit_" + n)
      .addEventListener("change", function () {
        let element = document.getElementById("digit_" + n);
        let index = element.selectedIndex;
        let color = element.options[index].text;

        digits[n] = index - 1;

        document.getElementById("band_" + n).style.backgroundColor = color;
        element.style.backgroundColor = color;
        element.style.color = dark_colours.includes(color) ? "white" : "black";
      });
  });

  document.getElementById("multiplier").addEventListener("change", function () {
    let element = document.getElementById("multiplier");
    let index = element.selectedIndex;
    let color = element.options[index].text;

    multiplier = index - 1;

    document.getElementById("band_3").style.backgroundColor = color;
    element.style.backgroundColor = color;
    element.style.color = dark_colours.includes(color) ? "white" : "black";
  });

  document.getElementById("tolerance").addEventListener("change", function () {
    const values = [0.10, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];

    let element = document.getElementById("tolerance");
    let index = element.selectedIndex;
    let color = element.options[index].text;

    tolerance = values[index - 1];

    document.getElementById("band_4").style.backgroundColor = color;
    element.style.backgroundColor = color;
    element.style.color = dark_colours.includes(color) ? "white" : "black";
  });

  document.getElementById("tcr").addEventListener("change", function () {
    const values = [250, 100, 50, 15, 25, 20, 10, 5, 1];

    let element = document.getElementById("tcr");
    let index = element.selectedIndex;
    let color = element.options[index].text;

    tcr = values[index - 1];

    document.getElementById("band_5").style.backgroundColor = color;
    element.style.backgroundColor = color;
    element.style.color = dark_colours.includes(color) ? "white" : "black";
  });

  document.querySelectorAll("select").forEach((element) => {
    element.addEventListener(
      "change",

      function () {
        let resistance, result, result2, error, number;

        if (digits[0] !== undefined && digits[1] !== undefined) {
          resistance = digits[0] + "" + digits[1];

          if (bands >= 5) {
            if (digits[2] !== undefined) {
              resistance += "" + digits[2];
            } else {
              document.getElementById("text").textContent =
                "Fill all required dropdowns to see the result.";
              return;
            }
          }

          if (multiplier === undefined) {
            multiplier = 3;
          }

          number = Math.round(resistance * Math.pow(10, multiplier)) / 1000;

          result = format(number);

          if (tolerance !== undefined && number != 0) {
            error = Math.round(tolerance * number * 1000000) / 1000000;
            result2 = format(number) + " ± " + format(error);
            result += " " + tolerance * 100 + "%";
          }

          if (bands == 6 && tcr !== undefined) {
            result += " " + tcr + "ppm/K";
          }

          if (result2 !== undefined) {
            result +=
              "\n" +
              result2 +
              "\n" +
              format(Math.round((number - error) * 1000000) / 1000000) +
              " – " +
              format(Math.round((number + error) * 1000000) / 1000000);
          }

          document.getElementById("text").style.whiteSpace = "pre-line";
          document.getElementById("text").textContent = result;
        } else {
          document.getElementById("text").textContent =
            "Fill all required dropdowns to see the result.";
        }
      }
    );
  });
});
