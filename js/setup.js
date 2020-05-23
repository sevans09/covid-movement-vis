function num_with_commas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


function ready(error, us) {
    if (error) throw error;
    $( "#alertdiv" ).hide();
    $( "#dem_options" ).hide();

    getLocation();

    var slider = document.querySelector('input[type="range"]');
    var radio = document.querySelector('input[type="radio"]');
    var val = document.getElementById("myRange").value;
    var dem = $("input[name='dem_radio']:checked").val();

    slider.addEventListener('change', function() {
    change_move();
    });

    window.addEventListener('keypress', function(e) {
        var keyCode = e.keyCode;
        var key = keyCode - 48
        if (key > 0 && key < 10) {
        document.getElementById("myRange").value = key;
        change_move();
        }
    });

    document.getElementById("toggleButton").value="MAP";
    makeMap(us);

    document.getElementById("toggleButton").addEventListener("click", 
    function(){ swapMap(us);});

    $('#radio_options').change(function(){
        dem = $("input[name='dem_radio']:checked").val();
        var val = document.getElementById("myRange").value;
        update_demographic(dem, val)
    });
}