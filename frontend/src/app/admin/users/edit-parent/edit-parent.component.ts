import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-parent',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-parent.component.html',
  styleUrl: './edit-parent.component.scss'
})
export class EditParentComponent implements OnInit{
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  userId!: number;

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();

    this.userService.getById(this.userId).subscribe((user) => {
      this.form.patchValue({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        parentProfile: {
          secondaryPhone: user.parentProfile?.secondaryPhone,
          platforms: user.parentProfile?.platforms ?? [],
          preferredGroups: user.parentProfile?.preferredGroups ?? [],
          emailOnly: user.parentProfile?.emailOnly,
        },
      });
    });
  }

  initForm() {
    this.form = this.fb.group({
      email: [''],
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      parentProfile: this.fb.group({
        secondaryPhone: [''],
        platforms: [[]],
        preferredGroups: [[]],
        emailOnly: [false],
      }),
    });
  }

  submit() {
    const data = this.form.value;
    const payload = {
      ...data,
      parentProfile: {
        ...data.parentProfile,
      },
    };

    this.userService.updateParent(this.userId, payload).subscribe(() => {
      this.router.navigate(['/admin/users']);
    });
  }
}