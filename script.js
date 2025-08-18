function format(number) {
  if (number === 0)
  {
    return "0 Ω";
  }

  const suffixes = ["µ", "m", "", "k", "M", "G", "T"];
  let index = Math.floor(Math.log10(number) / 3);

  return (
    Math.round(number / 10 ** (3 * index - 6)) / 1000000 +
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
    document.getElementById("resistance_input").value = "";
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
        element.style.borderColor = "";
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
    element.style.borderColor = "";
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

  function update_result () {
    let resistance, result, result2, error, number;

    text.style.fontStyle = "normal";

    if (digits[0] !== undefined && digits[1] !== undefined && multiplier !== undefined) {
      resistance = digits[0] + "" + digits[1];

      if (bands >= 5) {
        if (digits[2] !== undefined) {
          resistance += "" + digits[2];
        } else {
          text.style.fontStyle = "italic";
          text.innerHTML = "Fill all required (<span>*</span>) dropdowns to see the result.";
          return;
        }
      }

      document.getElementById("copy_button").style.display = "unset";

      number = resistance * 10 ** (multiplier - 3);

      result = format(number);

      document.getElementById("resistance_input").value = Math.round(number * 1000000) / 1000000;
      document.getElementById("resistance_input").style.borderColor = "";

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
      text.style.fontStyle = "italic";
      text.innerHTML = "Fill all required (<span>*</span>) dropdowns to see the result.";
    }

    if (bands == 3) {
      tolerance = tolerance_backup;
    }
  }

  document.querySelectorAll("select").forEach((element) => {
    element.addEventListener(
      "change", update_result
    );
  });

  document.getElementById("resistance_input").addEventListener("input", function () {
    let resistance = document.getElementById("resistance_input").value.trim();
    let resistance_string = String(resistance).replace(/\./g, "").replace(/^0+/, '');
    let resistance_length = resistance_string.replace(/0+$/, "").length;

    if (isNaN(resistance) || (bands <= 4 && (resistance_string.length < 2 || resistance_length > 2)) || (bands >= 5 && (resistance_string.length < 3 || resistance_length > 3)))
    {
      document.getElementById("error").style.display = "unset";
      document.getElementById("resistance_input").style.borderColor = "red";
      return;
    }

    const colours = ["Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Grey", "White"];
    const multipliers = ["Pink", "Silver", "Gold"].concat(colours);

    let element, color, limit = (bands >= 5 ? 2 : 1);

    for (let i = 0; i <= limit; ++i)
    {
      element = document.getElementById("digit_" + i);
      digits[i] = resistance_string[i];
      color = colours[digits[i]];
      element.value = color;
      element.style.backgroundColor = color;
      element.style.color = dark_colours.includes(color) ? "white" : "black";
      element.style.borderColor = "";
      document.getElementById("band_" + i).style.backgroundColor = color;
    }

    multiplier = Math.floor(Math.log10(resistance)) + (bands >= 5 ? 1 : 2);
    color = multipliers[multiplier];

    if (color === undefined)
    {
      document.getElementById("error").style.display = "unset";
      document.getElementById("resistance_input").style.borderColor = "red";
      return;
    }

    document.getElementById("error").style.display = "none";
    document.getElementById("resistance_input").style.borderColor = "";

    element = document.getElementById("multiplier");
    element.value = color;
    element.style.backgroundColor = color;
    document.getElementById("band_3").style.backgroundColor = color;
    element.style.color = dark_colours.includes(color) ? "white" : "black";
    element.style.borderColor = "";

    update_result();
  });
});
