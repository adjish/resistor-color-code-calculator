document.addEventListener("DOMContentLoaded", function() {
  var c1 = -1, c2 = -1, c3 = -1, c4 = -1

  document.getElementById('first').addEventListener('change', function1);
  document.getElementById('second').addEventListener('change', function2);
  document.getElementById('third').addEventListener('change', function3);
  document.getElementById('fourth').addEventListener('change', function4);

  function function1() {
    c1 = decode1(document.getElementById('first').value);
    f();
  }

  function function2() {
    c2 = decode1(document.getElementById('second').value);
    f();
  }

  function function3() {
    c3 = decode2(document.getElementById('third').value);
    f();
  }

  function function4() {
    c4 = decode3(document.getElementById('fourth').value);
    f();
  }

  function f() {
    if (c1 != -1 && c2 != -1 && c3 != -1 && c4 != -1)
    {
      document.getElementById("text").textContent = (c1 + '' + c2) * Math.pow(10, c3 - 2) + "±" + c4 * 100 + "% Ohms";
    }
  }

  function decode1(c) {
    const colors = [
      'black',
      'brown',
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'violet',
      'gray',
      'white'
    ];

    return colors.indexOf(c);
  }

  function decode2(c) {
    const colors = [
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
      'gray',
      'white'
    ];

    return colors.indexOf(c);
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
});
