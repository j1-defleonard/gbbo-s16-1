
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { WeeklyLog, WeeklyEvent, EventType } from '@/lib/types';
import { eventDetails } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  week: z.coerce.number().min(1).max(10),
  summary: z.string().optional(),
  starBaker: z.string().optional(),
  winTechnical: z.string().optional(),
  lastTechnical: z.string().optional(),
  handshake: z.array(z.string()).optional(),
  helpedBaker: z.array(z.string()).optional(),
  crying: z.array(z.string()).optional(),
  startOver: z.array(z.string()).optional(),
  eliminatedBaker: z.string().optional(),
});

type AdminFormValues = z.infer<typeof formSchema>;

export default function AdminPage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { bakers, addWeeklyLog, getLeague } = useAppContext();
  const league = getLeague(leagueId);
  const { toast } = useToast();
  
  if (!league) {
    return <div>League not found</div>;
  }

  const activeBakers = bakers.filter((b) => b.status === 'active');
  const nextWeek = league.weeklyLogs.length > 0 ? Math.max(...league.weeklyLogs.map(l => l.week)) + 1 : 1;

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      week: nextWeek,
      summary: "",
      handshake: [],
      helpedBaker: [],
      crying: [],
      startOver: [],
    },
  });

  function onSubmit(data: AdminFormValues) {
    const events: WeeklyEvent[] = [];
    
    const singleEventMap: { key: keyof AdminFormValues, type: EventType }[] = [
        { key: 'starBaker', type: 'STAR_BAKER' },
        { key: 'winTechnical', type: 'WIN_TECHNICAL' },
        { key: 'lastTechnical', type: 'LAST_TECHNICAL' },
    ];
    
    singleEventMap.forEach(item => {
        const bakerId = data[item.key as 'starBaker' | 'winTechnical' | 'lastTechnical'];
        if(bakerId && bakerId !== 'null') {
            events.push({ bakerId, week: data.week, type: item.type });
        }
    });

    const multiEventMap: { key: keyof AdminFormValues, type: EventType }[] = [
      { key: 'handshake', type: 'HANDSHAKE' },
      { key: 'helpedBaker', type: 'HELPED_BAKER' },
      { key: 'crying', type: 'CRYING' },
      { key: 'startOver', type: 'START_OVER' },
    ];

    multiEventMap.forEach(item => {
      const bakerIds = data[item.key as 'handshake' | 'helpedBaker' | 'crying' | 'startOver'];
      if(bakerIds && bakerIds.length > 0) {
        bakerIds.forEach(bakerId => {
          events.push({ bakerId, week: data.week, type: item.type });
        });
      }
    });

    const newLog: WeeklyLog = {
      week: data.week,
      summary: data.summary,
      events,
      eliminatedBakerId: data.eliminatedBaker && data.eliminatedBaker !== 'null' ? data.eliminatedBaker : null,
    };
    
    addWeeklyLog(leagueId, newLog);

    toast({
      title: 'Week Results Submitted',
      description: `Results for week ${data.week} have been saved.`,
    });
    
    form.reset({
        week: data.week + 1,
        summary: "",
        starBaker: '',
        winTechnical: '',
        lastTechnical: '',
        eliminatedBaker: '',
        handshake: [],
        helpedBaker: [],
        crying: [],
        startOver: [],
    });
  }
  
  const EventSelector: React.FC<{ name: 'starBaker' | 'winTechnical' | 'lastTechnical'; label: string }> = ({ name, label }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a baker..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
                <SelectItem value="null">None</SelectItem>
              {activeBakers.map((baker) => (
                <SelectItem key={baker.id} value={baker.id}>
                  {baker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const MultiEventSelector: React.FC<{ name: 'handshake' | 'helpedBaker' | 'crying' | 'startOver'; label: string }> = ({ name, label }) => (
     <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">{label}</FormLabel>
          </div>
          <div className="space-y-2">
          {activeBakers.map((baker) => (
            <FormField
              key={baker.id}
              control={form.control}
              name={name}
              render={({ field }) => {
                return (
                  <FormItem
                    key={baker.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(baker.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), baker.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== baker.id
                                )
                              )
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {baker.name}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-headline font-bold text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage weekly results for the <span className="font-bold text-primary">{league.name}</span> league.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit Weekly Results</CardTitle>
          <CardDescription>
              Use this form to enter the results for each week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="week"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Week</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter week number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Episode Summary</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter a brief summary of the week's episode..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <EventSelector name="starBaker" label={eventDetails.STAR_BAKER.description} />
                    <EventSelector name="winTechnical" label={eventDetails.WIN_TECHNICAL.description} />
                    <EventSelector name="lastTechnical" label={eventDetails.LAST_TECHNICAL.description} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MultiEventSelector name="handshake" label={eventDetails.HANDSHAKE.description} />
                  <MultiEventSelector name="helpedBaker" label={eventDetails.HELPED_BAKER.description} />
                  <MultiEventSelector name="crying" label={eventDetails.CRYING.description} />
                  <MultiEventSelector name="startOver" label={eventDetails.START_OVER.description} />
                </div>
                
                 <FormField
                      control={form.control}
                      name="eliminatedBaker"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eliminated Baker</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger className="border-destructive text-destructive">
                                <SelectValue placeholder="Select an eliminated baker..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {activeBakers.map((baker) => (
                                <SelectItem key={baker.id} value={baker.id}>
                                  {baker.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              
              <Button type="submit">Submit Week {form.watch('week')} Results</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
    </div>
  );
}
