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
      availability: this.fb.group({ //availability is the formGroupName in the template
        start:['', Validators.required],//both of the names here are the formControl names in the template
        end:['',Validators.required]
      })
    });
  }

  save(): void {
    //console.log(customerForm.form);
    //console.log('Saved: ' + JSON.stringify(customerForm.value));
  }
}
