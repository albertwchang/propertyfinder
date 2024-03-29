'use strict';
var React = require('react-native');
var SearchResults = require("./SearchResults");
var {
	ActivityIndicatorIOS,
	Component,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	View
} = React;

var styles = React.StyleSheet.create({
	description: {
		marginBottom: 20,
		fontSize: 18,
		textAlign: 'center',
		color: "#656565",
	},
	container: {
		padding: 30,
		// marginTop: 65,
		alignItems: "center",
	},
	container2: {
		marginTop: 65,
		flex: 1,
		backgroundColor: "black",
	},
	flowRight: {
	  flexDirection: 'row',
	  alignItems: 'center',
	  alignSelf: 'stretch'
	},
	buttonText: {
	  fontSize: 18,
	  color: 'white',
	  alignSelf: 'center'
	},
	button: {
	  height: 36,
	  flex: 1,
	  flexDirection: 'row',
	  backgroundColor: '#48BBEC',
	  borderColor: '#48BBEC',
	  borderWidth: 1,
	  borderRadius: 4,
	  marginBottom: 10,
	  alignSelf: 'stretch',
	  justifyContent: 'center'
	},
	searchInput: {
	  height: 36,
	  padding: 4,
	  marginRight: 5,
	  flex: 4,
	  fontSize: 18,
	  borderWidth: 1,
	  borderColor: '#48BBEC',
	  borderRadius: 4,
	  color: '#48BBEC'
	},
	image: {
		width: 217,
		height: 138
	}
});

function urlForQueryAndPage(key, value, pageNumber) {
	var data = {
			country: "uk",
			pretty: "1",
			encoding: "json",
			listing_type: "buy",
			action: "search_listings",
			page: pageNumber
	};
	data[key] = value;

	var queryString = Object.keys(data).map(key => key + "=" +encodeURIComponent(data[key])).join("&");
	return "http://api.nestoria.co.uk/api?" +queryString;
}

class SearchPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			searchString: "london",
			isLoading: false,
			message: ""
		}
	}
	onSearchTextChanged(event) {
		// the 'this' keyword normally refers to inside scope as this method will be used as a callback
		this.setState({
			searchString: event.nativeEvent.text
		})
	}
	onSearchPressed(event) {
		var query = urlForQueryAndPage("place_name", this.state.searchString, 1);
		this._executeQuery(query);
	}
	_executeQuery(query) {
		console.log(query);
		this.setState({
			isLoading: true
		});

		fetch(query)
			.then(response => response.json())
			.then(json => this._handleResponse(json.response))
			.catch(err => this.setState({
				isLoading: false,
				message: "Something bad happened:  " +err
			}));
	}
	_handleResponse(res) {
		this.setState({
			isLoading: false,
			message: ""
		});
		if (res.application_response_code.substr(0, 1) === "1") {
			this.props.navigator.push({
				title: "Results",
				component: SearchResults,
				passProps: {
					listings: res.listings
				}
			})
		} else {
			this.setState({
				message: "Location not recognized; please try again."
			})
		}
	}

	onLocationPressed() {
		navigator.geoLocation.getCurrentPosition(
			location => {
				var search = location.coords.latitude +"," +location.coords.longitude;
				this.setState({searchString: search});
				var query = urlForQueryAndPage("centre_point", search, 1);
				this._executeQuery(query);
			},
			error => {
				this.setState({
					message: "There was a problem with obtaining your location: " +error
				})
			}
		)
	}
	render() {
		var spinner = this.state.isLoading ? (<ActivityIndicatorIOS hidden="true" size="large" />) : (<View />);
		console.log('SearchPage.render');
		return (
			<ScrollView style={styles.container2}>
				<View style={styles.container}>
					<Text style={{color: 'red', fontSize: 18}}>{this.state.searchString}</Text>
					<Text style={styles.description}>
						Seach for houses to buy!
					</Text>
					<Text style={styles.description}>
						Search by place-name, postcode or search near your location.
					</Text>

					<View style={styles.flowRight}>
						<TextInput
							style={styles.searchInput}
							onChange={this.onSearchTextChanged.bind(this)}
							placeholder="Search via name or postcode"
							value={this.state.searchString} />
						<TouchableHighlight style={styles.button} underlayColor="#99d9f4" onPress={this.onSearchPressed.bind(this)}>
							<Text style={styles.buttonText}>Go</Text>
						</TouchableHighlight>
					</View>

					<TouchableHighlight style={styles.button} underlayColor='#99d9f4' onPress={this.onLocationPressed.bind(this)}>
					  <Text style={styles.buttonText}>Location</Text>
					</TouchableHighlight>
					<Image source={require('image!house')} style={styles.image} />
					{spinner}
					<Text style={styles.description} > {this.state.message}</Text>
				</View>
			</ScrollView>
		);
	}
}

module.exports = SearchPage;