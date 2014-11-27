angular.module('uploadApp')
.service('webDAV', function(Auth, $q) {
    
	    // returns an XML body including the given properties
    this.genPropRequestBody = function(properties) {
		var serializer = new XMLSerializer();
		var propBody = document.implementation.createDocument("DAV:", 
								      "propfind");
		var prop = propBody.createElementNS("DAV:", "prop");
		for (var i = 0; i < properties.length; ++i) {
		    prop.appendChild(propBody.createElementNS("DAV:", 
							      properties[i]));
		}
		propBody.documentElement.appendChild(prop);
		return(serializer.serializeToString(propBody));
	};

    this.propfind = function(url, auth, properties) {
		var deferred = $q.defer();
		var xhr = new XMLHttpRequest({mozSystem: true});
		xhr.open("PROPFIND", url, true);
		// xhr.setRequestHeader("Auth", Auth.encodeBasic());
		xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.user + ":" + auth.pass));
		xhr.setRequestHeader("Content-type",
				     "application/xml; charset='utf-8'");
		xhr.onload = function (e) {
		    if (xhr.readyState === 4) {
			if (xhr.status === 200) {
			    deferred.resolve(xhr.responseText);
			} else {
			    deferred.reject(xhr.statusText);
			}
		    }
		};
		xhr.onerror = function (e) {
		    deferred.reject(xhr.statusText);
		};
		if (!properties) {
		    xhr.send();
		}
		else {
		    var body = genPropRequestBody(properties);
		    xhr.send(body);
		}
		return deferred.promise;
	};

    this.get = function(url, auth) {
		var deferred = $q.defer();
		var xhr = new XMLHttpRequest({mozSystem: true});
		xhr.open("GET", url, true);
		//xhr.setRequestHeader("Authorization", Auth.getBasic());
		//xhr.setRequestHeader("Auth", Auth.encodeBasic());
		xhr.setRequestHeader("Authorization", "Basic " + btoa(auth.user + ":" + auth.pass));
		xhr.onload = function (e) {
		    if (xhr.readyState === 4) {
			if (xhr.status === 200) {
			    deferred.resolve(xhr.responseText);
			} else {
			    deferred.reject(xhr.statusText);
			}
		    }
		};
		xhr.onerror = function (e) {
		    deferred.reject(xhr.statusText);
		};
		xhr.send(null);
		return deferred.promise;
    };

    this.put = function(url, img) {
		var deferred = $q.defer();
		var xhr = new XMLHttpRequest({mozSystem: true});
		xhr.open("PUT", url, true);
		xhr.timeout = 120000;
		xhr.ontimeout = function() {
		    deferred.reject("Connection timed out");
		};
		Auth.encodeBasic().then(function (thing) {
		    Auth.encodeBasic().then(function (encodedCredentials) {
		    xhr.setRequestHeader("Authorization", encodedCredentials);
		    xhr.onload = function (e) {
			if (xhr.readyState === 4) {
			    if (xhr.status === 200 || xhr.status === 204 || xhr.status === 201) {
				deferred.resolve(xhr.responseText);
			    } else {
				deferred.reject(xhr.statusText);
			    }
			}
		    };
		    xhr.onerror = function () {
			deferred.reject("Connection failed");
		    };
		    xhr.send(img);
		    });
		});
		return deferred.promise;
    };
    
});
