import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
    IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, logoWhatsapp, mailOutline, lockClosedOutline, locationOutline, calendarOutline } from 'ionicons/icons';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonContent, IonItem, IonInput, IonButton, IonIcon, IonSpinner
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    owner = {
        name: '',
        whatsappNumber: '',
        email: '',
        password: '',
        address: '',
        dob: ''
    };
    loading = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private toastController: ToastController
    ) {
        addIcons({ personOutline, logoWhatsapp, mailOutline, lockClosedOutline, locationOutline, calendarOutline });
    }

    async register() {
        if (!this.owner.name || !this.owner.whatsappNumber || !this.owner.password) {
            this.showToast('Please fill in all required fields', 'warning');
            return;
        }

        this.loading = true;
        this.http.post('http://localhost:8080/api/owners/register', this.owner).subscribe({
            next: (response: any) => {
                this.loading = false;
                this.showToast('Registration successful! Please login.', 'success');
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.loading = false;
                this.showToast(error.error?.message || 'Registration failed', 'danger');
            }
        });
    }

    navigateToLogin() {
        this.router.navigate(['/login']);
    }

    async showToast(message: string, color: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color,
            position: 'bottom'
        });
        toast.present();
    }
}
