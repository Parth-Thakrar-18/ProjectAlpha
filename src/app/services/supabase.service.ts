import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  supabase = createClient(
    'https://nojhetsjwhnolfvpnzbc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vamhldHNqd2hub2xmdnBuemJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NzQwMTcsImV4cCI6MjA4ODM1MDAxN30.yuNmAvssYXkrPZu_zjMf6_X-iOneZShRO-YQpZruU9A'
  );

  constructor() { }

  async getData() {
    const { data, error } = await this.supabase
      .from('login_users')
      .select('*');

    return data;
  }
  async InsertData(formData: any): Promise<any> {

    const { data, error } = await this.supabase
    .from('login_users')
    .insert([
      {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      }
    ]);

  if (error) {
    console.error('Insert error:', error);
  }

  return data;
  }
  async sendOtp(email: string) {
    const { user, error } = await this.supabase.auth.signIn({
      email: email
    });

    return { data: user, error };
  }

 
}