import { Component, OnInit } from '@angular/core';
import { AbstractControl, NgForm } from '@angular/forms';

import { Customer } from './customer';

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



@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customer = new Customer();

  constructor() { }

  ngOnInit(): void {
  }

  save(customerForm: NgForm): void {
    console.log(customerForm.form);
    console.log('Saved: ' + JSON.stringify(customerForm.value));
  }
}
