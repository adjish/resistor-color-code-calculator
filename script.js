document.addEventListener("DOMContentLoaded", function() {
  let c1, c2, c3, multiplier, tolerance, ppm, bands = 4;

  document.getElementById('bands').addEventListener('change', bands_function);
  document.getElementById('first').addEventListener('change', function1);
  document.getElementById('second').addEventListener('change', function2);
  document.getElementById('third').addEventListener('change', function3);
  document.getElementById('multiplier').addEventListener('change', function4);
  document.getElementById('tolerance').addEventListener('change', function5);
  document.getElementById('ppm').addEventListener('change', function6);

  function bands_function() {
    bands = document.getElementById('bands').value;

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
  }

  function function1() {
    c1 = decode1(document.getElementById('first').value);
    f();
  }

  function function2() {
    c2 = decode1(document.getElementById('second').value);
    f();
  }

  function function3() {
    c3 = decode1(document.getElementById('third').value);
    f();
  }

  function function4() {
    multiplier = decode2(document.getElementById('multiplier').value);
    f();
  }

  function function5() {
    tolerance = decode3(document.getElementById('tolerance').value);
    f();
  }

  function function6() {
    ppm = decode4(document.getElementById('ppm').value);
    f();
  }

  function f() {
    let resistance, result, result2, error, number;

    if (c1 != undefined && c2 != undefined && multiplier != undefined)
    {
      resistance = c1 + '' + c2;

      if (bands >= 5)
      {
        if (c3 != undefined)
        {
          resistance += '' + c3;
        }
        else
        {
          document.getElementById("text").textContent = "Fill all required dropdowns to see the result";
          return;
        }
      }

      number = Math.round(resistance * Math.pow(10, multiplier))/1000;

      if (tolerance != undefined)
      {
        error = Math.round(tolerance * number * 10000000000)/10000000000;
        result2 = number + "±" + error + " Ohms";
        result = number + " Ohms " + tolerance * 100 + "%";
      }

      if (bands == 6 && ppm != undefined)
      {
        result += " " + ppm + "ppm";
      }

      if (result2 != undefined)
      {
        result += "\n" + result2 + "\n" + Math.round((number - error) * 10000000000)/10000000000 + " - " + Math.round((number + error) * 10000000000)/10000000000 + " Ohms";
      }

      document.getElementById("text").textContent = result;
    }
    else
    {
      document.getElementById("text").textContent = "Fill all required dropdowns to see the result";
    }
  }

  function decode1(c) {
    const colours = [
      'black',
      'brown',
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'violet',
      'grey',
      'white'
    ];

    return colours.indexOf(c);
  }

  function decode2(c) {
    const colours = [
      'pink',
      'silver',
      'gold',
      'black',
      'brown',
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'violet',
      'grey',
      'white'
    ];

    return colours.indexOf(c);
  }

  function decode3(c)
  {
    const tolerances = [
      "brown",
      "red",
      "green",
      "blue",
      "violet",
      "grey",
      "gold",
      "silver",
      "none"
    ];

    const values = [
      0.01,
      0.02,
      0.005,
      0.0025,
      0.001,
      0.0005,
      0.05,
      0.10,
      0.20
    ];

    return values[tolerances.indexOf(c)];
  }

  function decode4(c) {
    const ppm = [
      "black",
      "brown",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "violet",
      "grey"
    ];

    const values = [
      250,
      100,
      50,
      15,
      25,
      20,
      10,
      5,
      1
    ];

    return values[ppm.indexOf(c)];
  }
});
