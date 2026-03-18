import { React } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ApplyJob = () => {
    const { jobId } = useParams();
    const [ job, setjob ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ submitted, setSubmitted ] = useState(false);

    const [ name, setName ] = useState("");
    const [ email, setEmail ] = useState("");
    const [ linkedin, setLinkedin ] = useState("");

   useEffect(() => {
    const fetchJobDetails = async () => {
        const { data, error } = await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", jobId)
        .single();

        if (!error) setjob(data);
        setLoading(false);
    };
    fetchJobDetails();
   }, [jobId]); 

   const handleSbumit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("candidates").insert([
        {
            name,
            email,
            linkedin_url: linkedin,
            job_id: parseInt(jobId),
            status: "New"
        },
    ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        setSubmitted(true);
    }
   };

   if (loading) return <div style={styles.container}>Loading...</div>;
   if (!job) return <div style={styles.container}>Job not found.</div>;

  return <div></div>;
};

export default ApplyJob;
