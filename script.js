function format(number) {
  const suffixes = ["", "k", "M", "G"];
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
  let digits = Array(3).fill(undefined),
    multiplier,
    tolerance,
    tcr,
    bands = 4;

  document.getElementById("bands").addEventListener("change", function () {
    bands = document.getElementById("bands").value;

    switch (bands) {
      case "6":
        document.getElementById("third_band").style.display = "unset";
        document.getElementById("tcr_band").style.display = "unset";
        document.getElementById("tolerance_band").style.display = "unset";
        document.getElementById("band_2").style.display = "inline-block";
        document.getElementById("band_4").style.display = "inline-block";
        document.getElementById("band_5").style.display = "inline-block";
        break;
      case "5":
        document.getElementById("third_band").style.display = "unset";
        document.getElementById("tcr_band").style.display = "none";
        document.getElementById("tolerance_band").style.display = "unset";
        document.getElementById("band_2").style.display = "inline-block";
        document.getElementById("band_4").style.display = "inline-block";
        document.getElementById("band_5").style.display = "none";
        break;
      case "4":
        document.getElementById("third_band").style.display = "none";
        document.getElementById("tcr_band").style.display = "none";
        document.getElementById("tolerance_band").style.display = "unset";
        document.getElementById("band_2").style.display = "none";
        document.getElementById("band_4").style.display = "inline-block";
        document.getElementById("band_5").style.display = "none";
        break;
      default:
        document.getElementById("third_band").style.display = "none";
        document.getElementById("tcr_band").style.display = "none";
        document.getElementById("tolerance_band").style.display = "none";
        document.getElementById("band_2").style.display = "none";
        document.getElementById("band_4").style.display = "none";
        document.getElementById("band_5").style.display = "none";
        tolerance = 0.2;
    }
  });

  [0, 1, 2].forEach(function (n) {
    document
      .getElementById("digit_" + n)
      .addEventListener("change", function () {
        let color = document.getElementById("digit_" + n).value;

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
          color
        );

        document.getElementById("band_" + n).style.backgroundColor = color;
        document.getElementById("digit_" + n).style.backgroundColor = color;

        if (color == "black" || color == "brown" || color == "green" || color == "blue" || color == "grey")
        {
          document.getElementById("digit_" + n).style.color = "white";
        }
        else
        {
          document.getElementById("digit_" + n).style.color = "black";
        }
      });
  });

  document.getElementById("multiplier").addEventListener("change", function () {
    let color = document.getElementById("multiplier").value;

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

    multiplier = colours.indexOf(color);

    document.getElementById("band_3").style.backgroundColor = color;
    document.getElementById("multiplier").style.backgroundColor = color;

    if (color == "black" || color == "brown" || color == "green" || color == "blue" || color == "grey")
    {
      document.getElementById("multiplier").style.color = "white";
    }
    else
    {
      document.getElementById("multiplier").style.color = "black";
    }
  });

  document.getElementById("tolerance").addEventListener("change", function () {
    let color = document.getElementById("tolerance").value;

    const tolerances = [
      "brown",
      "red",
      "green",
      "blue",
      "violet",
      "grey",
      "gold",
      "silver",
    ];

    const values = [0.01, 0.02, 0.005, 0.0025, 0.001, 0.0005, 0.05, 0.1];

    tolerance =
      values[tolerances.indexOf(color)];

    document.getElementById("band_4").style.backgroundColor = color;
    document.getElementById("tolerance").style.backgroundColor = color;

    if (color == "brown" || color == "green" || color == "blue")
    {
      document.getElementById("tolerance").style.color = "white";
    }
    else
    {
      document.getElementById("tolerance").style.color = "black";
    }
  });

  document.getElementById("tcr").addEventListener("change", function () {
    let color = document.getElementById("tcr").value;

    const tcr_colours = [
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

    tcr = values[tcr_colours.indexOf(color)];

    document.getElementById("band_5").style.backgroundColor = color;
    document.getElementById("tcr").style.backgroundColor = color;

    if (color == "black" || color == "brown" || color == "green" || color == "blue" || color == "grey")
    {
      document.getElementById("tcr").style.color = "white";
    }
    else
    {
      document.getElementById("tcr").style.color = "black";
    }
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
