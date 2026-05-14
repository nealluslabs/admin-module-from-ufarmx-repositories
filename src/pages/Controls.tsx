import {  useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HiArrowLeft } from 'react-icons/hi2';
//import { agentService } from '@/services/agent.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
   // FormControl,
    FormField,
    //FormItem,
   // FormLabel, 
    //FormMessage
} from '@/components/ui/form';
import { ROUTES } from '@/utils/routes';
import toast from 'react-hot-toast';
import { controlsService } from '@/services/controls.service';

const numberField = z.coerce.number().min(0, 'Must be a positive number');

  
//  const formSchema = z.object({
//    retailers: z.object({
//      threshold: z.object({
//        gold: numberField,
//        silver: numberField,
//        bronze: numberField,
//        restricted: numberField,
//      }),
//      caps: z.object({
//        gold: numberField,
//        silver: numberField,
//        bronze: numberField,
//        restricted: numberField,
//      }),
//      interestRate: numberField,
//    }),
//    farmers: z.object({
//      threshold: z.object({
//        gold: numberField,
//        silver: numberField,
//        bronze: numberField,
//        restricted: numberField,
//      }),
//      caps: z.object({
//        gold: numberField,
//        silver: numberField,
//        bronze: numberField,
//        restricted: numberField,
//      }),
//      interestRate: numberField,
//    }),
//  });



  // ---------------- SCHEMAS ----------------

const tierSchema = z.object({
    farmers: z.object({
      gold: z.object({ min: numberField, max: numberField }),
      silver: z.object({ min: numberField, max: numberField }),
      bronze: z.object({ min: numberField, max: numberField }),
      basic: z.object({ min: numberField, max: numberField }),
    }),
    retailers: z.object({
      gold: z.object({ min: numberField, max: numberField }),
      silver: z.object({ min: numberField, max: numberField }),
      bronze: z.object({ min: numberField, max: numberField }),
      basic: z.object({ min: numberField, max: numberField }),
    }),
  });
  
  //const interestSchema = z.object({
  //  farmers: z.object({
  //    rate: numberField,
  //  }),
  //  retailers: z.object({
  //    rate: numberField,
  //  }),
  //});


  const interestSchema = z.object({
    farmers: z.object({
      rate: z.coerce.number(),
    }),
    retailers: z.object({
      rate: z.coerce.number(),
    }),
  });
  
  const capsSchema = z.object({
    retailers: z.object({
      gold: z.object({
        maxCreditLimit: numberField,
        maxSingleTransaction: numberField,
      }),
      silver: z.object({
        maxCreditLimit: numberField,
        maxSingleTransaction: numberField,
      }),
      bronze: z.object({
        maxCreditLimit: numberField,
        maxSingleTransaction: numberField,
      }),
      basic: z.object({
        maxCreditLimit: numberField,
        maxSingleTransaction: numberField,
      }),
    }),
  });


//type FormValues = z.input<typeof formSchema>;

export default function Controls() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    /**MONGO DB OBJECT IDS FOR VARIOUS CONTROLS - DONT DELETE FOR NOW - MAY 11 -2026 */
    const creditCapsId = '69ea1b6485adb4428bc0d33a'
    const creditTiersId = '69ea170e85adb4428bc0d338'
    const interestRateId = '69ea1ac285adb4428bc0d339'


    const isEditMode = !!id;
    const [_loading, setLoading] = useState(false);

  //  const defaultTier = { gold: 0, silver: 0, bronze: 0, restricted: 0 };

    const tierForm = useForm({ resolver: zodResolver(tierSchema) });
    //const interestForm = useForm({ resolver: zodResolver(interestSchema) });
    const capsForm = useForm({ resolver: zodResolver(capsSchema) });
    

    type TierFormValues = z.input<typeof tierSchema>;
    type CapsFormValues = z.input<typeof capsSchema>;
    
    type InterestFormValues = z.input<typeof interestSchema>;
    
    const interestForm = useForm<InterestFormValues>({
      resolver: zodResolver(interestSchema),
      defaultValues: {
        farmers: { rate: 0 },
        retailers: { rate: 0 },
      },
    });
    

   // const form = useForm<FormValues>({
   //   resolver: zodResolver(formSchema),
   //   defaultValues: {
   //     retailers: {
   //       threshold: defaultTier,
   //       caps: defaultTier,
   //       interestRate: 0,
   //     },
   //     farmers: {
   //       threshold: defaultTier,
   //       caps: defaultTier,
   //       interestRate: 0,
   //     },
   //   },
   // });

   // useEffect(() => {
   //     if (isEditMode && id) {
   //         loadControls(id);
   //     }
   // }, [id, isEditMode]);

   // const TierRow = ({ control, name, label }: any) => (
   //     <div>
   //       <p className="font-medium mb-2">{label}</p>
   //       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
   //         {['gold', 'silver', 'bronze', 'restricted'].map((tier) => (
   //           <FormField
   //             key={tier}
   //             control={control}
   //             name={`${name}.${tier}`}
   //             render={({ field }: { field: any }) => (
   //               <FormItem>
   //                 <FormLabel className="capitalize">{tier}</FormLabel>
   //                 <FormControl>
   //                   <Input type="number" {...field} />
   //                 </FormControl>
   //                 <FormMessage />
   //               </FormItem>
   //             )}
   //           />
   //         ))}
   //       </div>
   //     </div>
   //   );

      const TierInputs = ({ control, name }: any) => (
        <div className="grid grid-cols-4 gap-4">
          {["gold", "silver", "bronze", "basic"].map((tier) => (
            <div key={tier}>
              <p className="capitalize font-medium">{tier}</p>
      
              <FormField
                control={control}
                name={`${name}.${tier}.min`}
                render={({ field }) => (
                  <Input placeholder="Min" type="number" {...field} />
                )}
              />
      
              <FormField
                control={control}
                name={`${name}.${tier}.max`}
                render={({ field }) => (
                  <Input placeholder="Max" type="number" {...field} />
                )}
              />
            </div>
          ))}
        </div>
      );


      const CapsInputs = ({ control }: any) => (
        <div className="grid grid-cols-4 gap-4">
          {["gold", "silver", "bronze", "basic"].map((tier) => (
            <div key={tier}>
              <p className="capitalize font-medium">{tier}</p>
      
              <FormField
                control={control}
                name={`retailers.${tier}.maxCreditLimit`}
                render={({ field }) => (
                  <Input placeholder="Max Credit Limit" type="number" {...field} />
                )}
              />
      
              <FormField
                control={control}
                name={`retailers.${tier}.maxSingleTransaction`}
                render={({ field }) => (
                  <Input placeholder="Max Single Transaction" type="number" {...field} />
                )}
              />
            </div>
          ))}
        </div>
      );

    //const loadControls = async (agentId: string) => {
    //    try {
    //        setLoading(true);
    //        const agent = await agentService.getAgent(agentId); //this shoiuld be get controls
    //        form.reset({
    //            firstName: agent.firstName, //we'll get the right details later
    //            lastName: agent.lastName,
    //            email: agent.email,
    //            phoneNumber: agent.phoneNumber,
    //            location: agent.location || '',
    //        });
    //    } catch (error) {
    //        toast.error('Failed to load controls');
    //        
    //    } finally {
    //        setLoading(false);
    //    }
    //};

    //const onSubmit = async (_values: FormValues) => {
    //    try {
    //        setLoading(true);
    //        if (isEditMode && id) {
    //            await controlsService.updateControls(id, _values);
    //            toast.success('Controls updated successfully');
    //        } else {
    //            //await agentService.createAgent(values);
    //            //toast.success('Controls created successfully. Credentials sent via email.');
    //        }
    //        navigate(ROUTES.AGENTS);
    //    } catch (error: any) {
    //        console.error(error);
    //        const errorMessage = error.response?.data?.message || 'Something went wrong';
    //        toast.error(errorMessage);
    //    } finally {
    //        setLoading(false);
    //    }
    //};

    const interestOnSubmit = async (_values: InterestFormValues) => {
        try {
            setLoading(true);
        
                await controlsService.updateInterest(interestRateId, _values);
                toast.success('Interest Rates updated successfully');
           
            navigate(ROUTES.AGENTS);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const tiersOnSubmit = async (_values: TierFormValues) => {
        try {
            setLoading(true);
        
                await controlsService.updateCreditTiers(creditTiersId, _values);
                toast.success('Credit Caps updated successfully');
           
            navigate(ROUTES.AGENTS);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const capsOnSubmit = async (_values: CapsFormValues) => {
        try {
            setLoading(true);
        
                await controlsService.updateCreditCaps(creditCapsId, _values);
                toast.success('Credit Tiers updated successfully');
           
            navigate(ROUTES.AGENTS);
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };




    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.AGENTS)}>
                    <HiArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEditMode ? 'Edit Controls' : 'Edit Controls'}
                </h1>
            </div>

          
                 {/* <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        */}
                      
                      {/* ---------------- Retailers Section ---------------- */}
                     {/*
                      <div>
                      <Card>
                       <CardHeader>
                           <CardTitle>Retailers</CardTitle>
                    </CardHeader>
                <CardContent>
                       
                      
                        <TierRow control={form.control} name="retailers.threshold" label="Threshold" />
                        <TierRow control={form.control} name="retailers.caps" label="Caps" />
                      
                        <FormField
                          control={form.control}
                          name="retailers.interestRate"
                          render={({ field }: { field: any }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Interest Rate</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                 </CardContent>
                 </Card>
                        </div>
                        */}
                      
                      {/* ---------------- Farmers Section ---------------- */}
                     {/*
                      <div>
                      <Card>
                       <CardHeader>
                           <CardTitle>Farmers</CardTitle>
                    </CardHeader>
                     <CardContent>

                        
                      
                        <TierRow control={form.control} name="farmers.threshold" label="Threshold" />
                        <TierRow control={form.control} name="farmers.caps" label="Caps" />
                      
                        <FormField
                          control={form.control}
                          name="farmers.interestRate"
                          render={({ field }: { field: any }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Interest Rate</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

               </CardContent>
            </Card>
                      </div>
                        */}

                        
                         {/* ---------------- CREDIT TIERS ---------------- */}

               <Card>
                 <CardHeader>
                   <CardTitle>Credit Tiers</CardTitle>
                 </CardHeader>
               
                 <CardContent>
                   <Form {...tierForm}>
                     <form onSubmit={tierForm.handleSubmit(tiersOnSubmit)} className="space-y-6">
               
                       <h3>Farmers</h3>
                       <TierInputs control={tierForm.control} name="farmers" />
               
                       <h3>Retailers</h3>
                       <TierInputs control={tierForm.control} name="retailers" />
               
                       <Button type="submit">Save Credit Tiers</Button>
                     </form>
                   </Form>
                 </CardContent>
               </Card>


               {/* ---------------- INTEREST RATES ---------------- */}
               <Card>
               <CardHeader>
                 <CardTitle>Interest Rates</CardTitle>
               </CardHeader>
             
               <CardContent>
                 <Form {...interestForm}>
                   <form onSubmit={interestForm.handleSubmit(interestOnSubmit)} className="space-y-6">
             
                     <h3>Farmers</h3>
                     <FormField
                       control={interestForm.control}
                       name="farmers.rate"
                       render={({ field }) => 
                         <Input
                       type="number"
                       placeholder="Rate"
                       value={typeof field.value === "number" ? field.value : ""}
                       onChange={(e) => field.onChange(Number(e.target.value))}
                     />}
                     />
             
                     <h3>Retailers</h3>
                     <FormField
                       control={interestForm.control}
                       name="retailers.rate"
                       render={({ field }) => 
                        <Input
                          type="number"
                          placeholder="Rate"
                          value={typeof field.value === "number" ? field.value : ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                    }
                     />
             
                     <Button type="submit">Save Interest Rates</Button>
                   </form>
                 </Form>
               </CardContent>
            </Card>



            <Card>
             <CardHeader>
               <CardTitle>Credit Caps</CardTitle>
             </CardHeader>
           
             <CardContent>
               <Form {...capsForm}>
                 <form onSubmit={capsForm.handleSubmit(capsOnSubmit)} className="space-y-6">
           
                   <h3>Retailers</h3>
                   <CapsInputs control={capsForm.control} />
           
                   <Button type="submit">Save Credit Caps</Button>
                 </form>
               </Form>
             </CardContent>
            </Card>
                      
                      {/* ---------------- Submit ---------------- */}
                     {/*
                      <div className="flex justify-center pt-4">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[150px]">
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving...
                            </div>
                          ) : (
                            isEditMode ? 'Update Controls' : 'Update Controls'
                          )}
                        </Button>
                      </div>
                        */}

                    {/*  
                      </form>
                    </Form>
                      */}
           
        </div>
    );
}