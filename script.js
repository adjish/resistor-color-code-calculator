function format(number) {
  if (number === 0)
  {
    return "0 Ω";
  }

  const suffixes = ["µ", "m", "", "k", "M", "G", "T"];
  let index = Math.floor(Math.log10(number) / 3);

  return (
    Math.round(number / Math.pow(10, 3 * index - 6)) / 1000000 +
    " " +
    suffixes[index + 2] +
    "Ω"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  const dark_colours = ["Black", "Brown", "Red", "Green", "Blue", "Grey"];

  let digits = new Array(3),
    multiplier,
    tolerance,
    tcr,
    tolerance_backup,
    bands = 4;

  document.getElementById("reset_button").addEventListener("click", function () {
    window.location.assign(window.location.href);
  });

  document.getElementById("bands").addEventListener("change", function () {
    let values = new Array(6);

    bands = document.getElementById("bands").value;

    switch (bands) {
      case "6":
        values = ["unset", "unset", "unset", "inline-block", "inline-block", "inline-block"];
        break;
      case "5":
        values = ["unset", "none", "unset", "inline-block", "inline-block", "none"];
        break;
      case "4":
        values = ["none", "none", "unset", "none", "inline-block", "none"];
        break;
      default:
        values = ["none", "none", "none", "none", "none", "none"];
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
    const values = [0.1, 0.05, 0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005];

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
    let text = document.getElementById("text");
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
              text.innerHTML = "Fill all required (<span>*</span>) dropdowns to see the result.";
              return;
            }
          }

          if (multiplier === undefined) {
            multiplier = 3;
          }

          number = resistance * Math.pow(10, multiplier - 3);

          result = format(number);

          if (bands == 3) {
            tolerance_backup = tolerance;
            tolerance = 0.2;
          }

          if (tolerance !== undefined && number != 0) {
            error = tolerance * number;
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
              format(number - error) +
              " – " +
              format(number + error);
          }

          text.textContent = result;
        } else {
          text.innerHTML = "Fill all required (<span>*</span>) dropdowns to see the result.";
        }

        if (bands == 3) {
          tolerance = tolerance_backup;
        }
      }
    );
  });
});
