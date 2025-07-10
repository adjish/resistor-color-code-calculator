document.addEventListener("DOMContentLoaded", function () {
  let digits = Array(3).fill(undefined),
    multiplier,
    tolerance,
    ppm,
    bands = 4;

  document.getElementById("bands").addEventListener("change", function () {
    bands = document.getElementById("bands").value;

    switch (bands) {
      case "6":
        document.getElementById("third_band").style.display = "unset";
        document.getElementById("ppm_band").style.display = "unset";
        break;
      case "5":
        document.getElementById("third_band").style.display = "unset";
        document.getElementById("ppm_band").style.display = "none";
        break;
      default:
        document.getElementById("third_band").style.display = "none";
        document.getElementById("ppm_band").style.display = "none";
    }

    f();
  });

  [0, 1, 2].forEach(function (n) {
    document
      .getElementById("digit_" + n)
      .addEventListener("change", function () {
        const colours = [
          "black",
          "brown",
          "red",
          "orange",
          "yellow",
          "green",
          "blue",
          "violet",
          "grey",
          "white",
        ];

        digits[n] = colours.indexOf(
          document.getElementById("digit_" + n).value,
        );

        f();
      });
  });

  document.getElementById("multiplier").addEventListener("change", function () {
    const colours = [
      "pink",
      "silver",
      "gold",
      "black",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "violet",
      "grey",
      "white",
    ];

    multiplier = colours.indexOf(document.getElementById("multiplier").value);

    f();
  });

  document.getElementById("tolerance").addEventListener("change", function () {
    const tolerances = [
      "brown",
      "red",
      "green",
      "blue",
      "violet",
      "grey",
      "gold",
      "silver",
      "none",
    ];

    const values = [0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005, 0.05, 0.1, 0.2];

    tolerance =
      values[tolerances.indexOf(document.getElementById("tolerance").value)];

    f();
  });

  document.getElementById("ppm").addEventListener("change", function () {
    const ppms = [
      "black",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "violet",
      "grey",
    ];

    const values = [250, 100, 50, 15, 25, 20, 10, 5, 1];

    ppm = values[ppms.indexOf(document.getElementById("ppm").value)];

    f();
  });

  function f() {
    let resistance, result, result2, error, number;

    if (
      digits[0] != undefined &&
      digits[1] != undefined &&
      multiplier != undefined
    ) {
      resistance = digits[0] + "" + digits[1];

      if (bands >= 5) {
        if (digits[2] != undefined) {
          resistance += "" + digits[2];
        } else {
          document.getElementById("text").textContent =
            "Fill all required dropdowns to see the result";
          return;
        }
      }

      result = number =
        Math.round(resistance * Math.pow(10, multiplier)) / 1000;

      if (tolerance != undefined) {
        error = Math.round(tolerance * number * 10000000000) / 10000000000;
        result2 = number + "±" + error + " Ohms";
        result += " Ohms " + tolerance * 100 + "%";
      }

      if (bands == 6 && ppm != undefined) {
        result += " " + ppm + "ppm";
      }

      if (result2 != undefined) {
        result +=
          "\n" +
          result2 +
          "\n" +
          Math.round((number - error) * 10000000000) / 10000000000 +
          "–" +
          Math.round((number + error) * 10000000000) / 10000000000 +
          " Ohms";
      }

      document.getElementById("text").textContent = result;
    } else {
      document.getElementById("text").textContent =
        "Fill all required dropdowns to see the result";
    }
  }
});
