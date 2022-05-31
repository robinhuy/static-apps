new Vue({
  el: "#weather",
  data: {
    woeid: "91888417",
    location: "",
    status: "",
    time: "",
    temperature: "0",
    humidity: "0",
    wind: "0",
    pressure: "0",
    forecast: [],
    error: false
  },
  mounted: function() {
    this.changeLocation();
  },
  computed: {
    displayDate: function() {
      // Slice time
      return this.time.slice(0, 16);
    }
  },
  methods: {
    changeLocation: function() {
      // Yahoo weather API https://developer.yahoo.com/weather/
      var api =
        "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20%3D%20" +
        this.woeid +
        "%20and%20u%20%3D%20'c'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
      var self = this;

      // Call API by Axios https://github.com/mzabriskie/axios
      axios
        .get(api)
        .then(function(response) {
          var channel = response.data.query.results.channel;
          if (channel) {
            self.location = channel.location.city + ", " + channel.location.country;
            self.time = channel.item.pubDate;
            self.status = channel.item.condition.text;
            self.temperature = channel.item.condition.temp;
            self.humidity = channel.atmosphere.humidity;
            self.pressure = channel.atmosphere.pressure;
            self.wind = channel.wind.speed;
            self.forecast = channel.item.forecast;
          } else {
            self.error = true;
          }
        })
        .catch(function(error) {
          self.error = true;
        });
    },
    getThumbnail: function(status, size) {
      switch (status.toLowerCase()) {
        case "hot":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/hot.png";
        case "sunny":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/sunny.png";
        case "thunderstorms":
        case "severe thunderstorms":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/thunderstorms.png";
        case "scattered thunderstorms":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/rain_s_cloudy.png";
        case "partly cloudy":
        case "mostly cloudy":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/partly_cloudy.png";
        case "cloudy":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/cloudy.png";
        case "showers":
        case "scattered showers":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/rain_light.png";
        case "rain":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/rain.png";
        case "snow":
        case "heavy snow":
        case "snow flurries":
        case "blowing snow":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/snow.png";
        case "sleet":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/sleet.png";
        case "windy":
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/windy.png";
        default:
          return "https://ssl.gstatic.com/onebox/weather/" + size + "/cloudy.png";
      }
    }
  }
});
