working with redux
1.create a store.js file in src folder of react project.
2.create a reducer in src >> reducers >> Index.js.
3.In App.js 
import { Provider } from 'react-redux'; //connects react and redux;
import store from './store'; //importing store
4.then wrap everything in Provider then pass store   //<Provider store={store}></Provider>
5.then in reducers >> Index.js  it is our root reducer,we will add multiple reducer in it.
6.Creating a Reducer (alert reducer).
    create reducers >> alert.js
    import set and remove alert from types

    then import it in root reducer in reducers >> Index.js and pass it in combineReducers.
7.Create a actions folder in src actions >> types.js to hold variables and constants for types.    
8 Create src >> actions >> alert.js it is an alert action file
9.Calling an alert action in Register component
    connect Register component to redux
    export connect at bottom
    import { connect } from 'react-redux';
    import { setAlert } from '../../actions/alert';  //import setAlert
    import PropTypes from 'prop-types'; //import 
    when use some action pass it in connect //export default connect(null, { setAlert })(Register);
10.Add a component in component >> layout >> alert.js
11.Then in App.js add import Alert from './components/layout/Alert'; and wrap it .    