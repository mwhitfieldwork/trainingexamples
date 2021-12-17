import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidatorFn, Validators,FormArray } from '@angular/forms';
import {debounceTime} from 'rxjs/operators';

import { Customer } from './customer';

//CUSTOM VALIDATOR
//takes one parameter  and AbstractContorl object
//if the the condition fails it return as key(string) and the vlaue true
// the key is the name of the validator that you want added to the list of 
// validation errors
//If it passes the validation condition, then the function returns null

function ratingRange (c:AbstractControl):{[key:string]: boolean} | null{
  //for this function there is a text field the looking fo r vlaues 
  //greater than 1 and less than 5
  if(c.value !== null && (isNaN(c.value) || c.value < 1 || c.value >5)){
    return {'range':true}
  }
  return null;
}

//Duplicating Form Elements:
//We only want to duplicate 1 thing. If it is one feild ( we duplicate the form control)
//If we are duplicating a section of a form 9 address section we dump the form controls
//into a form Group and duplicate that
//Refactor Form builder to create the nested FG instance with a metho
//Make a formarray to hold the copies
//Loop through from array
//duplcate the form element(s)



//What if we need more than 1 param for the custom validator
//we can wrap our function factor method that returns our validator ( accepts many params)
//this function returns a validator function 
//add fat arrow to return the validator function instead of some value

/* function myValidator(param:any): ValidatorFn {
  return (c:AbstractControl):{[key:string]: boolean} | null => {
    for this function there is a text field the looking fo r vlaues 
     greater than 1 and less than 5
    if(somethingIsWrong)){
      return {'myvalidator':true}
    }
    return null;
  }
}
*/

// Factory Validator Function Example
function ratingRangeFactory(min:number, max:number): ValidatorFn {
  return (c:AbstractControl):{[key:string]: boolean} | null => {
    if(c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)){
      return {'range':true}
    }
    return null;
  };
}

//cross Field Validator Function
/*
function emailCompare(c:AbstractControl):{key:string}:boolean | null {
  let email = c.get('emailGroup.email');
  let confirmEmail = c.get('emailGroup.confirmEmail');
  if(email !== confirmEmail){
    return {'match':true}
  }
  return null
}
*/

/*
- Both form controls and from Groups have a valueChanges property. 
It emeits and event everytime the vlaue of a control changes
value changes is an observable ( emits a stream of values over time)
We susbsribe to the valuechanges property.

- There is also a statusChange property watching for the validation 
stream that gets emitted
*/

/*
this.myFormControl.valueChanges.subscribe(value => console.log(value))
--- Watches for value changes of the given field and console.logs it out

this.myFormGroup.valueChanges.subscribe(value => console.log(JSON.stringify(value)))
--- Anytime any on e of the controls in the form group changes. The value is emitted
 and the value is consoled out

 this.customerForm.valueChanges.subscribe(value => console.log(JSON.stringify(value)))
--- Watch for any changes in the entire form.

--We only want to watch if we want to do something when the user does something.

*/

function emailCompare(c:AbstractControl):{[key:string]: boolean} | null {
  let email = c.get('email');
  let confirmEmail = c.get('confirmEmail');
  if(email.pristine !== confirmEmail.pristine){ // if neither of the email fields are touched, pass validation
    return null;
  }
  if(email.value !== confirmEmail.value){//if the values done match  - throw error
    return {'match':true}//add match to the list of validation errors to check against
  }
  return null;
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer();
  customerForm:FormGroup;
  emailMessage:string; //contains the vlidation message to display to the user, if any

  constructor(private fb:FormBuilder) { }

  get addresses():FormArray {//returns a form array
                             //uses the get method to grab the addresses formControl which calls the buildAddress method
                              //ensure no other code changes the formArray, it is defined as a getter
                              //uses the <FormArray> to cast it to a certain type other wise it defaults to AbstractControl
    return <FormArray>this.customerForm.get('addresses');
  }
  
  private validationMessages ={ //lists all of the available messages for a form control
    required: 'please enter your email address', //key:value (key - the validation rule)
    email: 'Please enter a valid email address' // value the message to display
  }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      rating:[null,ratingRangeFactory(1,5)],
      //cross-field validation (nested form group)
      emailGroup: this.fb.group({ //availability is the formGroupName in the template
        email:['', [Validators.required, Validators.email]],//both of the names here are the formControl names in the template
        confirmEmail:['',Validators.required]
      },{validator: emailCompare}),//use the validator as the 2nd parameter
      notification:'email',
      phone:'',
      sendCatalog:true,
      addresses: this.fb.array([this.buildAddresses()]) // call the formGroup method
                                                        //buildAddresses in index 0 of this array
    });

    ///benefits of creating a from Group:
    // Match the value of the form model to the data model
    // check the touched, dirty and valid state
    //Watch for changes and react to them
    //Perform cross field vlaidation
    // and you can duplicate the group


//Form Array:
//a Group of form groups or arrays
//Uses indexes in stead of names to access




    this.customerForm.get('notification').valueChanges.subscribe(//you dont need to have the (click)="someaction()" - if you use a watcher you can set that functionality in the class
        value => this.setNotification(value)
    )

   const emailControl =  this.customerForm.get('emailGroup.email');
   emailControl.valueChanges.pipe(
    debounceTime(2000) //waits 2 second before triggering validation
   ).subscribe(
     value => this.setMessage(emailControl)
   )
  }

  buildAddresses(): FormGroup { //make a function that returns a form group like emailGroup
    return this.fb.group({ // create a formGroup for the below listed benefits
      addressType:'home', //call this method anytime an instance of the this form group is needed
      street1:['',Validators.required],
      street2:'',
      city:'',
      state:'',
      zip:'' // make sure the formbuilder name match the formControlName
    })
  }

  addAddressesToTheForm():void {
    this.addresses.push(this.buildAddresses())
  }

  save(): void {
  }

  setNotification(preferece:string) {
    const phoneControl = this.customerForm.get('phone');
    if (preferece === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators(); //gets rid of the set validation
    }
    phoneControl.updateValueAndValidity();// ??
  }

  setMessage(c:AbstractControl):void {
    this.emailMessage = '';
    if((c.touched || c.dirty) && c.errors){ // the condition will pass if the control was touched or dirty and has validatio errors
      this.emailMessage = Object.keys(c.errors).map(// the erros collection uses the validation rule name as the key 
        key => this.validationMessages[key]).join('');// the validationMessages object (in the Form control) also uses the validation rule name as the key for access the the message
    }
  }

}

//debounceTime  - lets ou type until a set time is up (1second for example) then it triggers the validation
//throttleTime - emits a value then ignores other values for a specific amount of time ( good for tracking mouse movements)
//distinctUntilChanged - surpresses duplicate consecutive items ( good for tracking key events when only the ctrl of shift key is changed)