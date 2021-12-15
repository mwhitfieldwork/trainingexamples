import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidatorFn, Validators } from '@angular/forms';

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

  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      rating:[null,ratingRangeFactory(1,5)],
      //cross-field validation (nested form group)
      emailGroup: this.fb.group({ //availability is the formGroupName in the template
        email:['', [Validators.required, Validators.email]],//both of the names here are the formControl names in the template
        confirmEmail:['',Validators.required]
      },{validator: emailCompare}),//use the validator as the 2nd parameter
      notification:'email',
      phone:''
    });

    this.customerForm.get('notification').valueChanges.subscribe(//you dont need to have the (click)="someaction()" - if you use a watcher you can set that functionality in the class
        value => this.setNotification(value)
    )
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

}
