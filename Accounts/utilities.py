from difflib import SequenceMatcher


class ObjectMatcher:
    LENIENT_RATIO = 0.8

    def __init__(self, queryset, **kwargs):
        self.queryset = queryset
        self.fields = kwargs.get("fields", [])
        self.ignore = list(map(lambda i: i.lower(), kwargs.get("ignore", [])))
        self.strict = kwargs.get("strict", True)
        self.match_ratio = kwargs.get("match_ratio", 0.6)
        self.sample = kwargs.get("sample")
        self.clean()

    def clean(self, sample=None):
        if sample is None:
            return ""
        sample = sample.strip().lower()
        if self.strict:
            for junk in self.ignore:
                sample = sample.replace(junk.lower(), "")
        else:
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
        s.set_seq2(self.clean(self.sample))
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
