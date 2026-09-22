import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel, IonFab, IonFabButton, IonModal, IonInput, IonTextarea,
    IonCard, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, close, warning, checkmarkCircle, time } from 'ionicons/icons';

interface Complaint {
    id: number;
    title: string;
    description: string;
    status: 'Open' | 'Resolved';
    date: string;
    studentName: string;
}

@Component({
    selector: 'app-complaints',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
        IonItem, IonLabel, IonFab, IonFabButton, IonModal, IonInput, IonTextarea,
        IonCard, IonCardContent, IonBadge
    ],
    templateUrl: './complaints.component.html',
    styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent {
    complaints: Complaint[] = [
        {
            id: 1,
            title: 'WiFi not working',
            description: 'The internet connection is very slow in Room 101.',
            status: 'Open',
            date: '2023-10-25',
            studentName: 'John Doe'
        },
        {
            id: 2,
            title: 'Leaking Tap',
            description: 'Bathroom tap is leaking continuously.',
            status: 'Resolved',
            date: '2023-10-20',
            studentName: 'Jane Smith'
        }
    ];

    isModalOpen = false;
    newComplaint = { title: '', description: '' };

    constructor() {
        addIcons({ add, close, warning, checkmarkCircle, time });
    }

    setOpen(isOpen: boolean) {
        this.isModalOpen = isOpen;
    }

    submitComplaint() {
        if (this.newComplaint.title && this.newComplaint.description) {
            this.complaints.unshift({
                id: Date.now(),
                title: this.newComplaint.title,
                description: this.newComplaint.description,
                status: 'Open',
                date: new Date().toISOString().split('T')[0],
                studentName: 'Current User' // Mock user
            });
            this.newComplaint = { title: '', description: '' };
            this.setOpen(false);
        }
    }

    resolveComplaint(id: number) {
        const complaint = this.complaints.find(c => c.id === id);
        if (complaint) {
            complaint.status = 'Resolved';
        }
    }
}
