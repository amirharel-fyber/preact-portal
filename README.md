# 🌌 preact-portal 🌠

[![NPM](https://img.shields.io/npm/v/preact-portal.svg?style=flat)](https://www.npmjs.org/package/preact-portal)
[![travis-ci](https://travis-ci.org/developit/preact-portal.svg?branch=master)](https://travis-ci.org/developit/preact-portal)

### **Render [Preact] components into SPACE**\*

_\* a space in the DOM. Sorry._

> Use this if you have a component that needs to render children into some other place in the DOM.
>
> An example of this would be modal dialogs, where you may need to render `<Dialog />` into `<body>`.


| [Demo #1] | [Demo #2] |
|:---------:|:---------:|
| _Moving around the DOM by changing `into`._ | _Open a full-page modal from within a thumbnail._ |
| <img src="https://i.gyazo.com/c08ff6fb5b3dc7da41099cb5c743ac86.gif" width="232"> | <img src="https://i.gyazo.com/afe7ebdaa2591dac92753af7066ac437.gif" width="176"> |



---


## Installation

Via npm:

`npm install --save preact-portal`



## Usage

```js
import { h, Component, render } from 'preact';
import Portal from 'preact-portal';

class Thumbnail extends Component {
  open = () => this.setState({ open:true });
  close = () => this.setState({ open:false });

  render({ url }, { open }) {
    return (
      <div class="thumb" onClick={this.open}>
        <img src={url} />

        { open ? (
          <Portal into="body">
            <div class="popup" onClick={this.close}>
              <img src={url} />
            </div>
          </Portal>
        ) : null }
      </div>
    );
  }
}

render(<Thumbnail url="//i.imgur.com/6Rp4hbs.gif" />, document.body);
```


---


Or, wrap up a very common case into a simple high order function:

```js
const Popup = ({ open, into="body", children }) => (
  open ? <Portal into={into}>{ children }</Portal> : null
);

// Example: show popup on error.
class Form extends Component {
  render({}, { error }) {
    return (
      <form>
        <Popup open={error}>
          <p>Error: {error}</p>
        </Popup>
        ...etc
      </form>
    );
  }
}
```
### iframes & document context
In cases were you need to render the portal inside of an `iframe`, you need to provide 
the prop `getDocument` which is a method that return the `document` as the context of the portal. 

Here is an example:

```js

const INITIAL_CONTENT = '<!DOCTYPE html><html><head></head><body><div id="frame-root"></div></body></html>';

class Iframe extends React.Component {
	node = null;
	getDocument = () => this.node.contentDocument;
	isMounted = false;
	initialContentRendered = false;
	
	componentDidMount() {
        this.isMounted = true;
        const doc = this.getDocument();
        if (doc && doc.readyState === 'complete') {
        	this.forceUpdate();
        } else {
        	this.node.addEventListener('load', this.handleLoad);
        }
	}
    
	componentWillUnmount() {
		this.isMounted = false;
        this.node.removeEventListener('load', this.handleLoad);
	}
    
	handleLoad = () => {
		this.forceUpdate();
	};

	
	renderContent() {
		if (!this.isMounted) {
			return null;
		}
		
		const doc = this.getDocument();
	
		if (!this.initialContentRendered) {
		  doc.open('text/html', 'replace');
		  doc.write(INITIAL_CONTENT);
		  doc.close();
		  this.initialContentRendered = true;
		}
	
		return (
		  <Portal into="#frame-root" getDocument={this.getDocument}>
			{this.props.children}
		  </Portal>
		);
	}
	
	render() {
		return (
			<iframe ref={node => this.node}>
				{this.renderContent()}
			</iframe>
		);
	}
}

class App extends React.Component {
	render() {
		return (
			<Iframe>
				<h1>I am inside a friendly iframe</h1>
			</Iframe>
		);
	}
}
```

[preact]: https://github.com/developit/preact
[Demo #1]: http://jsfiddle.net/developit/bsr7gmdd/
[Demo #2]: http://jsfiddle.net/developit/f1jmxtvg/
