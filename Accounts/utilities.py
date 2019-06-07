# ======================================================== #
# Copyright 2019 Ntech developers                          #
# Additional backend functionality goes here               #
# ======================================================== #

from difflib import SequenceMatcher


class ObjectMatcher:
    """
    Class that allows for soft searching of objects based on selected fields. Objects in models can be searched despite
    misspelling, word omissions, word disarrangement and word additions by utilising inbuilt difflib to carry out
    sequence matching which expresses matches as ratios which can then be used to threshold likely matches

    The constructor takes one positional argument 'queryset' which defines the collection of objects in which to carry
    out the search.
    It then accepts the following keyword arguments

    fields: list of the fields in the objects in the queryset where the search should look
    ignore: list of words to ignore during searching
    strict: boolean value determining whether the words to ignore should strictly be adhered to. if set to false ,
            LENIENT_RATIO is used as a matching threshold. default = True
    match_ratio: a float determining the matching threshold to be used. default = 0.6
    sample: the search criteria usually as string.
    """
    LENIENT_RATIO = 0.8  # Ratio for matching words to ignore

    def __init__(self, queryset, **kwargs):
        self.queryset = queryset
        self.fields = kwargs.get("fields", [])
        self.ignore = list(map(lambda i: i.lower(), kwargs.get("ignore", [])))
        self.strict = kwargs.get("strict", True)
        self.match_ratio = kwargs.get("match_ratio", 0.6)
        self.sample = kwargs.get("sample")
        self.clean()

    def clean(self, sample=None):
        """
        Removes the ignored words and converts sample to lowercase.
        :param sample:
        :return:
        """
        if sample is None:
            return ""
        sample = sample.strip().lower()
        if self.strict:
            # Remove words to be ignored directly
            for junk in self.ignore:
                sample = sample.replace(junk.lower(), "")
        else:
            # Remove words to be ignored softly using a match threshold of LENIENT_RATIO
            s = SequenceMatcher()
            for word in sample.split():
                s.set_seq2(word)
                for junk in self.ignore:
                    s.set_seq1(junk)
                    if s.quick_ratio() > ObjectMatcher.LENIENT_RATIO:
                        sample = sample.replace(word, "")
        return sample

    def get_match(self):
        s = SequenceMatcher()
        s.set_seq2(self.clean(self.sample))  # Set the cleaned search sample
        matches = []
        for _object in self.queryset:
            for field in self.fields:
                field = self.clean(field)
                s.set_seq1(self.clean(str(getattr(_object, field).lower())))
                ratio = s.quick_ratio()
                if ratio > self.match_ratio:
                    matches.append((_object, ratio))
        if matches:
            return max(matches, key=lambda x: x[1])[0]
        else:
            return None
