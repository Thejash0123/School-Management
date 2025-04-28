import React, { useEffect, useState } from "react";
import { Button, TextField, Grid, Box, Typography, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import Popup from '../../../components/Popup';

const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);
    const [errors, setErrors] = useState([{ subName: "", subCode: "", sessions: "" }]);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;

    const sclassName = params.id;
    const adminID = currentUser._id;
    const address = "Subject";

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    const validateSubject = (subject) => {
        let tempErrors = { subName: "", subCode: "", sessions: "" };

        // Validation rules
        if (!subject.subName.trim()) {
            tempErrors.subName = "Subject Name is required.";
        } else if (!/^[A-Za-z\s]+$/.test(subject.subName.trim())) {
            tempErrors.subName = "Subject Name should only contain letters and spaces.";
        }

        if (!subject.subCode.trim()) {
            tempErrors.subCode = "Subject Code is required.";
        } else if (!/^[A-Za-z0-9]+$/.test(subject.subCode.trim())) {
            tempErrors.subCode = "Subject Code should be alphanumeric without spaces.";
        }

        if (subject.sessions === "" || isNaN(subject.sessions)) {
            tempErrors.sessions = "Sessions must be a valid number.";
        } else if (Number(subject.sessions) < 0) {
            tempErrors.sessions = "Sessions cannot be negative.";
        }

        return tempErrors;
    };

    const handleSubjectChange = (index, field) => (event) => {
        const { value } = event.target;
        const newSubjects = [...subjects];
        newSubjects[index][field] = value;
        setSubjects(newSubjects);

        // Validate on change
        const newErrors = [...errors];
        newErrors[index] = validateSubject(newSubjects[index]);
        setErrors(newErrors);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
        setErrors([...errors, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);

        const newErrors = [...errors];
        newErrors.splice(index, 1);
        setErrors(newErrors);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName.trim(),
            subCode: subject.subCode.trim(),
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();

        let formValid = true;
        const validationErrors = subjects.map((subject) => {
            const subjectErrors = validateSubject(subject);
            if (subjectErrors.subName || subjectErrors.subCode || subjectErrors.sessions) {
                formValid = false;
            }
            return subjectErrors;
        });

        setErrors(validationErrors);

        if (!formValid) {
            setMessage("Please fix validation errors before submitting.");
            setShowPopup(true);
            return;
        }

        setLoader(true);
        dispatch(addStuff(fields, address));
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl());
            setLoader(false);
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <form onSubmit={submitHandler}>
            <Box mb={2}>
                <Typography variant="h6">Add Subjects</Typography>
            </Box>
            <Grid container spacing={2}>
                {subjects.map((subject, index) => (
                    <React.Fragment key={index}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                variant="outlined"
                                value={subject.subName}
                                onChange={handleSubjectChange(index, 'subName')}
                                sx={styles.inputField}
                                error={!!errors[index]?.subName}
                                helperText={errors[index]?.subName}
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Subject Code"
                                variant="outlined"
                                value={subject.subCode}
                                onChange={handleSubjectChange(index, 'subCode')}
                                sx={styles.inputField}
                                error={!!errors[index]?.subCode}
                                helperText={errors[index]?.subCode}
                                required
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Sessions"
                                variant="outlined"
                                type="number"
                                inputProps={{ min: 0 }}
                                value={subject.sessions}
                                onChange={handleSubjectChange(index, 'sessions')}
                                sx={styles.inputField}
                                error={!!errors[index]?.sessions}
                                helperText={errors[index]?.sessions}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Box display="flex" alignItems="flex-end">
                                {index === 0 ? (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleAddSubject}
                                    >
                                        Add Subject
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRemoveSubject(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </React.Fragment>
                ))}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" type="submit" disabled={loader}>
                            {loader ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </Box>
                </Grid>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </Grid>
        </form>
    );
};

export default SubjectForm;

const styles = {
    inputField: {
        '& .MuiInputLabel-root': {
            color: '#838080',
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#838080',
        },
    },
};
