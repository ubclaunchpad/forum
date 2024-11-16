'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useContext, useEffect } from 'react'
import { userContext } from '@/contexts/userContext'

const UserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  pronouns: z.string().optional(),
  university: z.string().min(1, 'University is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
})

type UserFormValues = z.infer<typeof UserSchema>

export default function ProfileSettings() {
    const user = useContext(userContext);
    
    const form = useForm<UserFormValues>({
        resolver: zodResolver(UserSchema),
        defaultValues: {
                firstName: '',
                lastName: '',
                pronouns: '',
                university: '',
                email: '',
                password: '',
            }
    });

    useEffect(() => {
        setTimeout(() => {
            form.reset({
                // replace with call to endpoint using user data from useContext
                firstName: 'Malcolm',
                lastName: 'Mackenzie',
                pronouns: 'he/him',
                university: 'UBC',
                email: user?.email,
                password: '12345678',
            });
        }, 500);
    }, []);

    

    function onSubmit(data: UserFormValues) {
        console.log(data);
        // Send info to endpoint
    }

    return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile settings</h1>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <FormField
                control={form.control}
                name="pronouns"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Pronouns</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>University</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input {...field} readOnly={true} type="email" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <Input
                        {...field}
                        readOnly={true}
                        type='text'
                        />
                    </div>
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                    <Button 
                        variant="link" 
                        className="px-0 py-0 h-6" 
                        onClick={() => alert('Change password functionality not implemented in this demo.')}
                    >
                        Change password
                    </Button>
                    </FormDescription>
                </FormItem>
                )}
            />

            <Button type="submit" className="w-full">
                Edit profile
            </Button>
            </form>
        </Form>
        </div>
    </div>
    );
}