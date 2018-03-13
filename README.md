# Google Maps: My Bike Tours

Have you ever wanted your fans to know where you were when you made that YT video? Or when you posted that Instagram post?
With this app you can make a map and place your custom markers on it! By adding coordinates you can place them wherever you want! You can also make a route by linking them so there is a line through those markers. You can add your own content to the info-window (appears when you click on it) from each marker.
This content must include:
- Title
- Description
- Date
This content might include:
- Link to ride data
- Other links
- An image or a Youtube video
In markers.json all the markers are being stored. See [below](#modifying-markers.json) how to modify this file. This particular application has all my routes, marker images and other data I wanted to show on my map.

## Setup
To run the application:
1. if you haven't already, install [node.js](http://blog.teamtreehouse.com/install-node-js-npm-windows) and [gulp](https://gulpjs.com/) (run `npm install -g gulp-cli`)
2. open a terminal (Windows: PowerShell) in the folder (`cd` to the right folder)
3. run `npm install`
4. run `gulp serve` to start server
5. navigate to [localhost:9000](localhost:9000) to see the application
6. run `gulp` to make a `dist` folder with the code you can put on a website!

## Modifying markers.json

`scripts/markers.json` is an array of markers. Each marker is made like this:

```json
{
  "title": "",
  "location": {
    "lat": 12.345678,
    "lng": 12.345678
  },
  "description": "",
  "date": "",
}
```
**Each of the above properties are required to make the marker.**
- `title`: Title of marker (heading of info-window)
- `location`: Object of `lat`, `lng` coordinates. This is for the location of the marker on the map.
- `description`: Description of marker. Displayed in info-window.
- `date`: Date is also displayed in the info-window (above description)

**The markers are gonna be appearing in order, so make sure yours are in the order you want them to appear on the screen**

### Extra properties
- `img`: Name of image file in `images/` (**Don't put 'images/' in value,**)(**Do include the extention**)
- `youtube`: A string of characters positioned: https://www.youtube.com/watch?v=AT_THIS_PART&... of the Youtube Url (to create iframe a different URL is used, but only those characters which are unique to each video is used.)
- `rideData`: A link to the page where you can see the riding data for that day (I use Strava). Displayed as a link with name: 'View ride data'.
- `links`: Used like this:
```json
"links": {
  "title": "",
  "links": [{
    "name": "",
    "link": ""
    }]
}
```
  - `title`: Title of (the group of) links
  - `links`: An array of objects containing:
    - `name`: The displayed text of anchor tag
    - `link`: The actual link (href)
- `icon`: Name of image file in `images/` (**Don't put 'images/' in value,**)(**Do include the extention**) that will be the icon of the marker. (Default dimensions of marker icon: 26X42)
- `line`: This is used to tie the markers with the same value of this property together to create a line. The name you give this prop you'll also have to adjust in `main.js` (see more at [Add a Line](#add-a-line)).

## Other Customizations

### Change Focus of Map
By default, the map is focused on a particular part of the world. To adjust the center of the map and zoom level:
In `scripts/main.js`:
```javascript
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 53.661212, lng: 10.898780 },
    zoom: 5
  });
  getMarkers();
}
```
Change lat and lngs of `center` which is the center point.
Change `zoom` number to zoom in/out (the higher, the more zoomed-in (max 21))

### Add Photos
Add all of the necessary photos in `images/`. These might include photos used inside of info-windows or marker icons.

### Add Logo
If you want to add a logo to your info-window (will appear left of title), adjust in `scripts/main.js` where it says `const logo = 'LogoSmall.png'` Rename the name in quotes to your logo.

### Add a Line
To add a line when you have a new trip or route:
1. In `scripts/markers.json`: Add the property of `line` to all of the markers that need to be on this line.
2. In `scripts/main.js`:
  - At `const lines` Add the name of your line below the comment, which corresponds to the value of the `line` property in all of your markers you want to connect with each other like this: `LINENAME: [];`
  - At:
  ```javascript
  if (marker.line === 'none') {
    lines.none.push(marker);
  }
  ```
  Copy and paste the above segment below the comment below it and replace `none` with your name (make sure it corresponds with the one at `const lines` and in `markers.json`)

If you've done everything right, the two points should now be connected!

### Customize Colors
In `styles/main.scss` you can see at the top are 5 variables. These five describe the color used in these area's (all in the info-window). You can use custom hex-decimals to replace the hex-decimals there to have custom colors for these places.

### The Animations
When you come to the point you have quite a few lines and markers you can probably see that your markers in a particular route are being spawn one by one and the line will be drawn when all markers are placed for each route. This is why each marker needs the information about in which `line` it is and why they need to be in order. It makes it a little harder to add markers, but it makes for better customizability.

## Features that might be added in the future:
- A screen where you can make each marker (instead of directly in markers.json)
