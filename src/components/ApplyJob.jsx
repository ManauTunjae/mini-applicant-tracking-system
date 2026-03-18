import { React } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ApplyJob = () => {
    const { jobId } = useParams();
    const [ job, setjob ] = useState(null);

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

  return <div></div>;
};

export default ApplyJob;
